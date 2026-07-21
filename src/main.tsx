import React, { ChangeEvent, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  BookOpenText,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Gift,
  HeartHandshake,
  Home,
  ImagePlus,
  Info,
  MapPin,
  MessageCircle,
  Mic,
  QrCode,
  Recycle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import "./styles.css";

type Status =
  | "残す"
  | "家族に聞く"
  | "譲る"
  | "売る"
  | "寄付する"
  | "写真だけ残して手放す"
  | "処分する"
  | "保留";

type FamilyResponse = "欲しい" | "いらない" | "写真だけ見たい" | "相談したい";

type Item = {
  id: number;
  name: string;
  category: string;
  owner: string;
  location: string;
  era: string;
  memory: string;
  status: Status;
  image: string;
  recipient: string;
  responses: Record<FamilyResponse, number>;
  guide: string[];
};

const statuses: Status[] = [
  "残す",
  "家族に聞く",
  "譲る",
  "売る",
  "寄付する",
  "写真だけ残して手放す",
  "処分する",
  "保留",
];

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
  "よく分からない物",
];

const sampleItems: Item[] = [
  {
    id: 1,
    name: "祖母の花柄カップ",
    category: "食器",
    owner: "母",
    location: "実家 1階 食器棚",
    era: "1980年代",
    memory:
      "来客の日だけ出していたカップ。祖母が紅茶を入れてくれた時の香りまで思い出す。",
    status: "家族に聞く",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1100&q=80",
    recipient: "未定",
    responses: { 欲しい: 2, いらない: 1, 写真だけ見たい: 1, 相談したい: 0 },
    guide: ["割れ物として梱包", "リサイクルショップ向き", "寄付できる可能性あり"],
  },
  {
    id: 2,
    name: "父のフィルムカメラ",
    category: "趣味の道具",
    owner: "父",
    location: "書斎 引き出し",
    era: "1970年代",
    memory:
      "運動会や旅行でいつも首から下げていたカメラ。使えるかは分からないが、父らしい品。",
    status: "譲る",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80",
    recipient: "長男候補",
    responses: { 欲しい: 1, いらない: 2, 写真だけ見たい: 0, 相談したい: 1 },
    guide: ["専門店に相談向き", "フリマ向き", "電池・フィルムの取り扱い注意"],
  },
  {
    id: 3,
    name: "子どもの頃のアルバム",
    category: "写真・アルバム",
    owner: "自分",
    location: "押し入れ 上段",
    era: "1990年代",
    memory:
      "全部は残せないけれど、家族旅行と入学式のページだけは見返せるようにしたい。",
    status: "写真だけ残して手放す",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1100&q=80",
    recipient: "データ化後に家族共有",
    responses: { 欲しい: 0, いらない: 1, 写真だけ見たい: 3, 相談したい: 0 },
    guide: ["個人情報に注意", "スキャン候補", "紙ごみは自治体確認"],
  },
];

const guideByCategory: Record<string, string[]> = {
  "写真・アルバム": ["個人情報に注意", "スキャン候補", "紙ごみは自治体確認"],
  食器: ["割れ物として梱包", "リサイクルショップ向き", "寄付できる可能性あり"],
  "着物・服": ["買取相談向き", "寄付できる可能性あり", "カビ・防虫剤に注意"],
  アクセサリー: ["家族確認推奨", "専門店に相談向き", "価値不明なら保留"],
  趣味の道具: ["専門店に相談向き", "フリマ向き", "付属品を一緒に確認"],
  "手紙・書類": ["個人情報に注意", "保管年限を確認", "裁断・溶解処理候補"],
  家具: ["粗大ごみ候補", "搬出経路を確認", "譲渡・買取候補"],
  "子どもの作品": ["写真だけ残す候補", "本人確認推奨", "ありがとうカード向き"],
  記念品: ["家族確認推奨", "写真だけ残す候補", "由来をメモ"],
  家電: ["小型家電回収候補", "自治体確認が必要", "電池・データ消去に注意"],
  よく分からない物: ["自治体確認が必要", "家族確認推奨", "専門業者に相談向き"],
};

const responseLabels: FamilyResponse[] = [
  "欲しい",
  "いらない",
  "写真だけ見たい",
  "相談したい",
];

function createItemId(items: Item[]) {
  return Math.max(...items.map((item) => item.id), 0) + 1;
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
  const [items, setItems] = useState<Item[]>(sampleItems);
  const [selectedId, setSelectedId] = useState(sampleItems[0].id);
  const [city, setCity] = useState("世田谷区");
  const [shareMessage, setShareMessage] = useState("");
  const [snsDraft, setSnsDraft] = useState(
    "祖母の花柄カップを写真で残して、手放す準備をしています。東京都世田谷区の実家に長くあったものです。"
  );
  const [newItem, setNewItem] = useState({
    name: "",
    category: "記念品",
    owner: "",
    location: "",
    memory: "",
    image: "",
  });

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const totalResponses = useMemo(
    () => Object.values(selected.responses).reduce((sum, value) => sum + value, 0),
    [selected.responses]
  );

  const completion = useMemo(() => {
    const decided = items.filter(
      (item) => !["保留", "家族に聞く"].includes(item.status)
    ).length;
    return Math.round((decided / items.length) * 100);
  }, [items]);

  function updateSelected(partial: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.id === selected.id ? { ...item, ...partial } : item))
    );
  }

  function addFamilyResponse(response: FamilyResponse) {
    updateSelected({
      responses: {
        ...selected.responses,
        [response]: selected.responses[response] + 1,
      },
    });
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNewItem((current) => ({ ...current, image: URL.createObjectURL(file) }));
  }

  function addNewItem() {
    if (!newItem.name.trim()) return;
    const item: Item = {
      id: createItemId(items),
      name: newItem.name.trim(),
      category: newItem.category,
      owner: newItem.owner || "未設定",
      location: newItem.location || "未設定",
      era: "時期未設定",
      memory: newItem.memory || "まだ思い出メモはありません。",
      status: "家族に聞く",
      image:
        newItem.image ||
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1100&q=80",
      recipient: "未定",
      responses: { 欲しい: 0, いらない: 0, 写真だけ見たい: 0, 相談したい: 0 },
      guide: guideByCategory[newItem.category] ?? guideByCategory["よく分からない物"],
    };

    setItems((current) => [item, ...current]);
    setSelectedId(item.id);
    setNewItem({ name: "", category: "記念品", owner: "", location: "", memory: "", image: "" });
  }

  async function createShareMessage() {
    const message = `story_boxで「${selected.name}」の行き先を確認しています。欲しい / いらない / 写真だけ見たい / 相談したい から返事をください。`;
    setShareMessage(message);
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Clipboard access can fail in some local preview contexts.
    }
  }

  const maskedDraft = maskSensitiveText(snsDraft);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${city} ${selected.category} ごみ 分別`
  )}`;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="メインナビゲーション">
        <div className="brand">
          <div className="brand-mark">
            <Archive size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>story_box</strong>
            <span>思い出の品を引き継ぐ</span>
          </div>
        </div>

        <nav className="nav-list">
          <button className="nav-item active" type="button">
            <Home size={18} />
            台帳
          </button>
          <button className="nav-item" type="button">
            <MessageCircle size={18} />
            家族確認
          </button>
          <button className="nav-item" type="button">
            <Recycle size={18} />
            処分ガイド
          </button>
          <button className="nav-item" type="button">
            <QrCode size={18} />
            QRラベル
          </button>
        </nav>

        <section className="progress-card" aria-label="整理の進捗">
          <div className="progress-head">
            <span>整理の進捗</span>
            <strong>{completion}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${completion}%` }} />
          </div>
          <p>保留を減らし、家族が困らない状態に近づけます。</p>
        </section>
      </aside>

      <section className="workspace">
        <header className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              家族でゆるく決める、生前整理の下書き
            </span>
            <h1>残す物も、手放す物も、物語が分かる形に。</h1>
            <p>
              品物の写真と思い出、家族の希望、処分の方向性を1枚のカードにまとめます。
              「捨てていいのか分からない」を減らすためのプロトタイプです。
            </p>
          </div>

          <div className="hero-photo" aria-label="思い出の品のプレビュー">
            <img src={selected.image} alt={`${selected.name}の写真`} />
            <div className="hero-photo-caption">
              <span>{selected.category}</span>
              <strong>{selected.name}</strong>
            </div>
          </div>
        </header>

        <section className="stats-row" aria-label="台帳サマリー">
          <Stat icon={<ClipboardCheck size={20} />} label="登録品" value={`${items.length}品`} />
          <Stat icon={<UserRoundCheck size={20} />} label="家族回答" value={`${totalResponses}件`} />
          <Stat icon={<Gift size={20} />} label="譲り先" value={selected.recipient} />
          <Stat icon={<ShieldCheck size={20} />} label="共有前確認" value="匿名化あり" />
        </section>

        <section className="main-grid">
          <div className="left-column">
            <section className="panel add-panel">
              <div className="panel-title">
                <div>
                  <span className="caption">New item</span>
                  <h2>物カードを追加</h2>
                </div>
                <ImagePlus size={22} aria-hidden="true" />
              </div>

              <div className="form-grid">
                <label>
                  品名
                  <input
                    value={newItem.name}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="例: 父の腕時計"
                  />
                </label>
                <label>
                  カテゴリ
                  <select
                    value={newItem.category}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, category: event.target.value }))
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  持ち主
                  <input
                    value={newItem.owner}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, owner: event.target.value }))
                    }
                    placeholder="例: 母"
                  />
                </label>
                <label>
                  保管場所
                  <input
                    value={newItem.location}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="例: 実家 2階 押し入れ"
                  />
                </label>
              </div>

              <label className="wide-label">
                一言思い出メモ
                <textarea
                  value={newItem.memory}
                  onChange={(event) =>
                    setNewItem((current) => ({ ...current, memory: event.target.value }))
                  }
                  placeholder="誰から来たものか、なぜ捨てづらいかを一言で。"
                />
              </label>

              <div className="upload-row">
                <label className="upload-button">
                  <Camera size={18} />
                  写真を選ぶ
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </label>
                <button className="primary-button" type="button" onClick={addNewItem}>
                  追加する
                  <ChevronRight size={18} />
                </button>
              </div>
            </section>

            <section className="item-board" aria-label="登録された品物">
              {items.map((item) => (
                <button
                  className={`item-card ${item.id === selected.id ? "selected" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                >
                  <img src={item.image} alt={`${item.name}の写真`} />
                  <div>
                    <span>{item.category}</span>
                    <strong>{item.name}</strong>
                    <small>{item.status}</small>
                  </div>
                </button>
              ))}
            </section>
          </div>

          <section className="panel detail-panel">
            <div className="panel-title">
              <div>
                <span className="caption">Selected item</span>
                <h2>{selected.name}</h2>
              </div>
              <BookOpenText size={22} aria-hidden="true" />
            </div>

            <div className="detail-image">
              <img src={selected.image} alt={`${selected.name}の大きな写真`} />
            </div>

            <div className="meta-list">
              <Meta icon={<Tags size={17} />} label="カテゴリ" value={selected.category} />
              <Meta icon={<HeartHandshake size={17} />} label="持ち主" value={selected.owner} />
              <Meta icon={<MapPin size={17} />} label="保管場所" value={selected.location} />
            </div>

            <section className="memory-box">
              <div>
                <Mic size={18} />
                <span>思い出メモ</span>
              </div>
              <p>{selected.memory}</p>
            </section>

            <div className="status-picker" aria-label="行き先ステータス">
              {statuses.map((status) => (
                <button
                  className={selected.status === status ? "active" : ""}
                  key={status}
                  type="button"
                  onClick={() => updateSelected({ status })}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          <aside className="right-column">
            <section className="panel share-panel">
              <div className="panel-title">
                <div>
                  <span className="caption">Family share</span>
                  <h2>家族に聞く</h2>
                </div>
                <Send size={22} aria-hidden="true" />
              </div>
              <p className="panel-copy">
                LINEに貼れる短文を作り、家族の反応をここに集める想定です。
              </p>

              <button className="line-button" type="button" onClick={createShareMessage}>
                <MessageCircle size={18} />
                共有文を作る
              </button>
              {shareMessage && <p className="share-message">{shareMessage}</p>}

              <div className="response-grid">
                {responseLabels.map((label) => (
                  <button key={label} type="button" onClick={() => addFamilyResponse(label)}>
                    <span>{label}</span>
                    <strong>{selected.responses[label]}</strong>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel guide-panel">
              <div className="panel-title">
                <div>
                  <span className="caption">Disposal guide</span>
                  <h2>処分の目安</h2>
                </div>
                <Recycle size={22} aria-hidden="true" />
              </div>

              <div className="guide-list">
                {selected.guide.map((guide) => (
                  <span key={guide}>
                    <Check size={16} />
                    {guide}
                  </span>
                ))}
              </div>

              <label className="city-search">
                市区町村
                <div>
                  <input value={city} onChange={(event) => setCity(event.target.value)} />
                  <a href={searchUrl} target="_blank" rel="noreferrer" aria-label="自治体の分別検索を開く">
                    <Search size={18} />
                  </a>
                </div>
              </label>
              <p className="notice">
                <Info size={16} />
                地域差が大きいため、処分方法は断定せず自治体確認へ誘導します。
              </p>
            </section>

            <section className="panel thanks-panel">
              <div className="panel-title">
                <div>
                  <span className="caption">Thank-you card</span>
                  <h2>ありがとうカード</h2>
                </div>
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <div className="thanks-card">
                <img src={selected.image} alt="" />
                <div>
                  <span>{selected.era}</span>
                  <strong>{selected.name}</strong>
                  <p>{selected.memory}</p>
                </div>
              </div>

              <label className="wide-label compact">
                SNS共有前の下書き
                <textarea value={snsDraft} onChange={(event) => setSnsDraft(event.target.value)} />
              </label>
              <div className="masked-output">
                <ShieldCheck size={17} />
                <span>{maskedDraft}</span>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="meta-item">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
