import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  Camera,
  Check,
  Copy,
  ExternalLink,
  HeartHandshake,
  MessageCircle,
  Plus,
  Recycle,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import "./styles.css";

type Status = "残す" | "家族に聞く" | "譲る" | "売る" | "寄付する" | "手放す" | "保留";

type Item = {
  id: string;
  name: string;
  category: string;
  owner: string;
  location: string;
  memory: string;
  status: Status;
  image: string;
  wantedBy: string[];
  createdAt: string;
};

type FormState = {
  name: string;
  category: string;
  owner: string;
  location: string;
  memory: string;
  status: Status;
  image: string;
};

const storageKey = "story_box_items_v2";

const categories = [
  "写真・アルバム",
  "食器",
  "着物・服",
  "アクセサリー",
  "趣味の道具",
  "手紙・書類",
  "家具",
  "子どもの作品",
  "記念品",
  "家電",
  "その他",
];

const statuses: Status[] = ["残す", "家族に聞く", "譲る", "売る", "寄付する", "手放す", "保留"];

const guideByCategory: Record<string, string[]> = {
  "写真・アルバム": ["個人情報を確認", "必要なページだけ撮影", "紙の処分は自治体確認"],
  食器: ["割れ物として扱う", "セットなら買取候補", "寄付先を確認"],
  "着物・服": ["状態を写真で残す", "買取・寄付候補", "カビや防虫剤に注意"],
  アクセサリー: ["家族に先に確認", "価値不明なら保留", "専門店相談も候補"],
  趣味の道具: ["付属品をまとめる", "専門店・フリマ候補", "動作確認できれば記録"],
  "手紙・書類": ["個人情報に注意", "写真公開しない", "裁断・溶解処理候補"],
  家具: ["搬出経路を確認", "粗大ごみ候補", "譲渡・買取候補"],
  "子どもの作品": ["本人に確認", "写真だけ残す候補", "一言メモを添える"],
  記念品: ["由来を先にメモ", "欲しい人を確認", "写真だけ残す候補"],
  家電: ["小型家電回収候補", "電池・データに注意", "自治体確認が必要"],
  その他: ["家族に確認", "自治体確認が必要", "判断できなければ保留"],
};

const sampleItems: Item[] = [
  {
    id: "sample-cup",
    name: "祖母の花柄カップ",
    category: "食器",
    owner: "母",
    location: "実家 1階 食器棚",
    memory: "来客の日だけ出していたカップ。祖母が紅茶を入れてくれた時の香りまで思い出す。",
    status: "家族に聞く",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1100&q=80",
    wantedBy: ["姉", "長男"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-camera",
    name: "父のフィルムカメラ",
    category: "趣味の道具",
    owner: "父",
    location: "書斎 引き出し",
    memory: "旅行や運動会で父がいつも首から下げていたもの。使えるかは分からないが、父らしい品。",
    status: "譲る",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80",
    wantedBy: ["長男"],
    createdAt: new Date().toISOString(),
  },
];

const emptyForm: FormState = {
  name: "",
  category: "記念品",
  owner: "",
  location: "",
  memory: "",
  status: "家族に聞く",
  image: "",
};

function loadItems() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return sampleItems;
    const parsed = JSON.parse(stored) as Item[];
    return parsed.length > 0 ? parsed : sampleItems;
  } catch {
    return sampleItems;
  }
}

function toForm(item: Item): FormState {
  return {
    name: item.name,
    category: item.category,
    owner: item.owner,
    location: item.location,
    memory: item.memory,
    status: item.status,
    image: item.image,
  };
}

function formToItem(form: FormState, existing?: Item): Item {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: form.name.trim() || "名前のない品",
    category: form.category,
    owner: form.owner.trim() || "未設定",
    location: form.location.trim() || "未設定",
    memory: form.memory.trim() || "まだ思い出メモはありません。",
    status: form.status,
    image:
      form.image ||
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1100&q=80",
    wantedBy: existing?.wantedBy ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

function maskSensitiveText(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[メール]")
    .replace(/\d{3}-\d{4}/g, "[郵便番号]")
    .replace(/0\d{1,4}-\d{1,4}-\d{3,4}/g, "[電話番号]")
    .replace(/(東京都|北海道|(?:京都|大阪)府|.{2,3}県).{2,16}(市|区|町|村)/g, "[地域]")
    .replace(/(株式会社|有限会社|合同会社)[^\s、。]{2,16}/g, "[会社名]")
    .replace(/[一-龥]{2,4}(さん|君|ちゃん|先生|氏)/g, "[個人名]");
}

function App() {
  const [items, setItems] = useState<Item[]>(loadItems);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [form, setForm] = useState<FormState>(() => toForm(items[0] ?? formToItem(emptyForm)));
  const [mode, setMode] = useState<"view" | "edit" | "new">("view");
  const [city, setCity] = useState("世田谷区");
  const [copied, setCopied] = useState("");
  const [wantedName, setWantedName] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!selected && items[0]) {
      setSelectedId(items[0].id);
    }
  }, [items, selected]);

  const visibleItem = mode === "new" ? formToItem(form) : selected;
  const guides = guideByCategory[visibleItem?.category ?? "その他"] ?? guideByCategory["その他"];

  const summary = useMemo(() => {
    const decided = items.filter((item) => !["保留", "家族に聞く"].includes(item.status)).length;
    return {
      total: items.length,
      askFamily: items.filter((item) => item.status === "家族に聞く").length,
      decided,
    };
  }, [items]);

  function startNew() {
    setMode("new");
    setForm(emptyForm);
    setCopied("");
  }

  function startEdit(item: Item) {
    setMode("edit");
    setForm(toForm(item));
    setCopied("");
  }

  function cancelForm() {
    setMode("view");
    if (selected) setForm(toForm(selected));
  }

  function saveForm() {
    if (mode === "new") {
      const item = formToItem(form);
      setItems((current) => [item, ...current]);
      setSelectedId(item.id);
      setForm(toForm(item));
      setMode("view");
      return;
    }

    if (!selected) return;
    const updated = formToItem(form, selected);
    setItems((current) => current.map((item) => (item.id === selected.id ? updated : item)));
    setForm(toForm(updated));
    setMode("view");
  }

  function selectItem(item: Item) {
    setSelectedId(item.id);
    setForm(toForm(item));
    setMode("view");
    setCopied("");
  }

  function deleteSelected() {
    if (!selected) return;
    const next = items.filter((item) => item.id !== selected.id);
    setItems(next);
    if (next[0]) {
      setSelectedId(next[0].id);
      setForm(toForm(next[0]));
    } else {
      setSelectedId("");
      setForm(emptyForm);
      setMode("new");
    }
  }

  function updateStatus(status: Status) {
    if (!selected) return;
    setItems((current) =>
      current.map((item) => (item.id === selected.id ? { ...item, status } : item))
    );
  }

  function addWantedBy() {
    if (!selected || !wantedName.trim()) return;
    const name = wantedName.trim();
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id && !item.wantedBy.includes(name)
          ? { ...item, wantedBy: [...item.wantedBy, name], status: "譲る" }
          : item
      )
    );
    setWantedName("");
  }

  function removeWantedBy(name: string) {
    if (!selected) return;
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id ? { ...item, wantedBy: item.wantedBy.filter((entry) => entry !== name) } : item
      )
    );
  }

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateForm("image", String(reader.result));
    reader.readAsDataURL(file);
  }

  function shareText(item: Item) {
    return `実家の整理で「${item.name}」の行き先を確認しています。\n\n${item.memory}\n\n欲しい / 写真だけ残したい / いらない のどれかを教えてください。`;
  }

  async function copyShareText() {
    if (!selected) return;
    const text = shareText(selected);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("共有文をコピーしました");
    } catch {
      setCopied(text);
    }
  }

  async function nativeShare() {
    if (!selected || !navigator.share) {
      await copyShareText();
      return;
    }
    await navigator.share({ title: selected.name, text: shareText(selected) });
  }

  function resetData() {
    setItems(sampleItems);
    setSelectedId(sampleItems[0].id);
    setForm(toForm(sampleItems[0]));
    setMode("view");
    setCopied("サンプルに戻しました");
  }

  if (!visibleItem) {
    return null;
  }

  const maskedMemory = maskSensitiveText(visibleItem.memory);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${city} ${visibleItem.category} ごみ 分別`
  )}`;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Archive size={21} aria-hidden="true" />
          </span>
          <div>
            <strong>story_box</strong>
            <span>思い出の品を、家族で整理する</span>
          </div>
        </div>
        <button className="add-button" type="button" onClick={startNew}>
          <Plus size={18} />
          新しい品
        </button>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">生前整理のための試作版</p>
          <h1>これは残す？誰か欲しい？</h1>
          <p>
            写真と思い出を1つだけ残して、家族に聞く。まずはその小さな流れだけに絞りました。
          </p>
        </div>
        <div className="summary">
          <span>{summary.total}品</span>
          <span>{summary.askFamily}件確認中</span>
          <span>{summary.decided}件決定</span>
        </div>
      </section>

      <section className="layout">
        <aside className="item-list" aria-label="登録品一覧">
          <div className="section-head">
            <h2>品物</h2>
            <button type="button" onClick={resetData}>サンプルに戻す</button>
          </div>
          {items.map((item) => (
            <button
              className={`list-item ${item.id === selected?.id && mode !== "new" ? "active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => selectItem(item)}
            >
              <img src={item.image} alt={`${item.name}の写真`} />
              <span>
                <strong>{item.name}</strong>
                <small>{item.status}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="main-card">
          {mode === "view" && selected ? (
            <ItemView
              city={city}
              copied={copied}
              guides={guides}
              item={selected}
              maskedMemory={maskedMemory}
              searchUrl={searchUrl}
              setCity={setCity}
              startEdit={startEdit}
              updateStatus={updateStatus}
              copyShareText={copyShareText}
              nativeShare={nativeShare}
              deleteSelected={deleteSelected}
              wantedName={wantedName}
              setWantedName={setWantedName}
              addWantedBy={addWantedBy}
              removeWantedBy={removeWantedBy}
            />
          ) : (
            <ItemForm
              form={form}
              mode={mode === "edit" ? "edit" : "new"}
              onCancel={cancelForm}
              onImageUpload={handleImageUpload}
              onSave={saveForm}
              updateForm={updateForm}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function ItemView({
  addWantedBy,
  city,
  copied,
  copyShareText,
  deleteSelected,
  guides,
  item,
  maskedMemory,
  nativeShare,
  removeWantedBy,
  searchUrl,
  setCity,
  setWantedName,
  startEdit,
  updateStatus,
  wantedName,
}: {
  addWantedBy: () => void;
  city: string;
  copied: string;
  copyShareText: () => void;
  deleteSelected: () => void;
  guides: string[];
  item: Item;
  maskedMemory: string;
  nativeShare: () => void;
  removeWantedBy: (name: string) => void;
  searchUrl: string;
  setCity: (value: string) => void;
  setWantedName: (value: string) => void;
  startEdit: (item: Item) => void;
  updateStatus: (status: Status) => void;
  wantedName: string;
}) {
  return (
    <>
      <div className="item-hero">
        <img src={item.image} alt={`${item.name}の写真`} />
      </div>

      <div className="content-block">
        <div className="title-row">
          <div>
            <p className="category">{item.category}</p>
            <h2>{item.name}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => startEdit(item)}>
            編集
          </button>
        </div>

        <p className="memory">{item.memory}</p>

        <div className="small-meta">
          <span>{item.owner}</span>
          <span>{item.location}</span>
        </div>
      </div>

      <section className="content-block">
        <h3>行き先</h3>
        <div className="status-row">
          {statuses.map((status) => (
            <button
              className={item.status === status ? "active" : ""}
              key={status}
              type="button"
              onClick={() => updateStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="content-block action-block">
        <div className="action-title">
          <MessageCircle size={18} />
          <h3>家族に聞く</h3>
        </div>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={nativeShare}>
            <Share2 size={18} />
            共有する
          </button>
          <button className="secondary-button" type="button" onClick={copyShareText}>
            <Copy size={18} />
            文面コピー
          </button>
        </div>
        {copied && <p className="note">{copied}</p>}

        <div className="wanted-box">
          <label>
            欲しい人メモ
            <div className="inline-input">
              <input
                value={wantedName}
                onChange={(event) => setWantedName(event.target.value)}
                placeholder="例: 姉"
              />
              <button type="button" onClick={addWantedBy}>追加</button>
            </div>
          </label>
          <div className="chips">
            {item.wantedBy.length === 0 ? (
              <span className="muted-chip">まだ希望者なし</span>
            ) : (
              item.wantedBy.map((name) => (
                <button key={name} type="button" onClick={() => removeWantedBy(name)}>
                  {name} ×
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="content-block">
        <div className="action-title">
          <Recycle size={18} />
          <h3>処分の目安</h3>
        </div>
        <ul className="guide-list">
          {guides.map((guide) => (
            <li key={guide}>
              <Check size={16} />
              {guide}
            </li>
          ))}
        </ul>
        <label className="city-search">
          市区町村で調べる
          <div className="inline-input">
            <input value={city} onChange={(event) => setCity(event.target.value)} />
            <a href={searchUrl} target="_blank" rel="noreferrer">
              <Search size={18} />
              検索
            </a>
          </div>
        </label>
      </section>

      <section className="content-block quiet-block">
        <div className="action-title">
          <ShieldCheck size={18} />
          <h3>共有前チェック</h3>
        </div>
        <p>{maskedMemory}</p>
      </section>

      <button className="delete-button" type="button" onClick={deleteSelected}>
        <Trash2 size={18} />
        この品を削除
      </button>
    </>
  );
}

function ItemForm({
  form,
  mode,
  onCancel,
  onImageUpload,
  onSave,
  updateForm,
}: {
  form: FormState;
  mode: "edit" | "new";
  onCancel: () => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  updateForm: (key: keyof FormState, value: string) => void;
}) {
  return (
    <section className="form-card">
      <div className="title-row">
        <div>
          <p className="category">{mode === "new" ? "新規登録" : "編集"}</p>
          <h2>{mode === "new" ? "品物を追加" : "品物を編集"}</h2>
        </div>
      </div>

      <label className="photo-picker">
        {form.image ? <img src={form.image} alt="選択した写真" /> : <Camera size={32} />}
        <span>写真を選ぶ</span>
        <input type="file" accept="image/*" onChange={onImageUpload} />
      </label>

      <div className="form-grid">
        <label>
          品名
          <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
        </label>
        <label>
          カテゴリ
          <select
            value={form.category}
            onChange={(event) => updateForm("category", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          持ち主
          <input value={form.owner} onChange={(event) => updateForm("owner", event.target.value)} />
        </label>
        <label>
          保管場所
          <input
            value={form.location}
            onChange={(event) => updateForm("location", event.target.value)}
          />
        </label>
      </div>

      <label>
        一言思い出メモ
        <textarea
          value={form.memory}
          onChange={(event) => updateForm("memory", event.target.value)}
          placeholder="誰から来たものか、なぜ残していたかを一言で。"
        />
      </label>

      <label>
        行き先
        <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onSave}>
          <HeartHandshake size={18} />
          保存
        </button>
        <button className="secondary-button" type="button" onClick={onCancel}>
          やめる
        </button>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
