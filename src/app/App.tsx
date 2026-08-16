import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Plus, X, Package, SlidersHorizontal, Camera,
  ChevronLeft, ChevronRight, Pencil, Copy, ExternalLink, AlertCircle, Trash2,
  ArrowUpDown, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  photo: string;
  photoUrl?: string;
  image?: string;
  maker: string;
  productName?: string;
  colorName: string;
  colorCode: string;
  material: string;
  gauge: string;
  quantity: number;
  purchaseDate: string;
  url?: string;
  notes?: string;
  weightG?: number;
  lengthM?: number;
  needleMin?: number;
  needleMax?: number;
  hookMin?: number;
  hookMax?: number;
  gaugeStitches?: number;
  gaugeRows?: number;
};

type ZaikomaneItemRow = {
  id: string;
  photo: string | null;
  image: string | null;
  maker: string | null;
  product_name: string | null;
  color_name: string | null;
  color_code: string | null;
  material: string | null;
  gauge: string | null;
  quantity: number | null;
  purchase_date: string | null;
  url: string | null;
  notes: string | null;
  weight_g: number | null;
  length_m: number | null;
  needle_min: number | null;
  needle_max: number | null;
  hook_min: number | null;
  hook_max: number | null;
  gauge_stitches: number | null;
  gauge_rows: number | null;
  created_at: string | null;
};

type ZaikomaneItemPayload = {
  photo: string;
  maker: string;
  product_name: string | null;
  color_name: string;
  color_code: string;
  material: string;
  gauge: string;
  quantity: number;
  purchase_date: string | null;
  url: string | null;
  notes: string | null;
  weight_g: number | null;
  length_m: number | null;
  needle_min: number | null;
  needle_max: number | null;
  hook_min: number | null;
  hook_max: number | null;
  gauge_stitches: number | null;
  gauge_rows: number | null;
};

type ZaikomaneItemInsert = ZaikomaneItemPayload & {
  user_id: string;
};

type ZaikomaneItemUpdate = ZaikomaneItemPayload & {
  updated_at: string;
};

type SortOption = "date_desc" | "date_asc" | "qty_desc" | "qty_asc" | "maker" | "color";
type StockFilter = "all" | "low" | "enough";

type FilterState = {
  sort: SortOption;
  materials: string[];
  gauges: string[];
  stock: StockFilter;
};

type RegisterForm = {
  photoPath: string;
  photoUrl: string;
  photoFile: File | null;
  photoPreview: string | null;
  photoError: string;
  maker: string;
  productName: string;
  colorName: string;
  colorCode: string;
  material: string;
  gauge: string;
  weightG: number | undefined;
  lengthM: number | undefined;
  needleMin: number | undefined;
  needleMax: number | undefined;
  hookMin: number | undefined;
  hookMax: number | undefined;
  gaugeStitches: number | undefined;
  gaugeRows: number | undefined;
  quantity: number;
  purchaseDate: string;
  url: string;
  notes: string;
};

type EditForm = {
  photoPath: string;
  photoUrl: string;
  photoFile: File | null;
  photoPreview: string | null;
  photoError: string;
  maker: string;
  productName: string;
  colorName: string;
  colorCode: string;
  material: string;
  gauge: string;
  weightG: number | undefined;
  lengthM: number | undefined;
  needleMin: number | undefined;
  needleMax: number | undefined;
  hookMin: number | undefined;
  hookMax: number | undefined;
  gaugeStitches: number | undefined;
  gaugeRows: number | undefined;
  quantity: number;
  purchaseDate: string;
  url: string;
  notes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FILTER: FilterState = {
  sort: "date_desc",
  materials: [],
  gauges: [],
  stock: "all",
};

const SORT_OPTIONS: { value: SortOption; label: string; sub: string }[] = [
  { value: "date_desc", label: "購入日", sub: "新→旧" },
  { value: "date_asc",  label: "購入日", sub: "旧→新" },
  { value: "qty_desc",  label: "個数",   sub: "多→少" },
  { value: "qty_asc",   label: "個数",   sub: "少→多" },
  { value: "maker",     label: "メーカー", sub: "名前順" },
  { value: "color",     label: "色名",   sub: "名前順" },
];

const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: "all",    label: "すべて" },
  { value: "low",    label: "在庫わずか" },
  { value: "enough", label: "在庫あり" },
];

const INITIAL_REGISTER_FORM: RegisterForm = {
  photoPath: "",
  photoUrl: "",
  photoFile: null,
  photoPreview: null,
  photoError: "",
  maker: "",
  productName: "",
  colorName: "",
  colorCode: "#8B6E52",
  material: "",
  gauge: "",
  weightG: undefined,
  lengthM: undefined,
  needleMin: undefined,
  needleMax: undefined,
  hookMin: undefined,
  hookMax: undefined,
  gaugeStitches: undefined,
  gaugeRows: undefined,
  quantity: 1,
  purchaseDate: "",
  url: "",
  notes: "",
};

const MATERIALS = ["ウール", "メリノウール", "アルパカ", "コットン", "アクリル", "シルク", "リネン", "レーヨン", "モヘヤ", "カシミヤ", "紙", "その他"];
const GAUGES = ["極細", "細", "中細", "合太", "並太", "極太"];
const SUGGESTED_MAKERS = ["Hamanaka", "Richmore", "Daruma", "Puppy", "Ski毛糸"];
const GAUGE_SIZE: Record<string, number> = { 極細: 4, 細: 6, 中細: 8, 合太: 10, 並太: 13, 極太: 17 };
const ITEMS_STORAGE_KEY = "yarn-inventory-items";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRODUCT_IMAGE_BUCKET = "product-images";
const PHOTO_SIGNED_URL_EXPIRES_IN = 600;
const PRODUCT_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f2f2f2'/%3E%3Ccircle cx='400' cy='300' r='118' fill='none' stroke='%23d8d8d8' stroke-width='36'/%3E%3Ccircle cx='400' cy='300' r='72' fill='%23ffffff' stroke='%23e4e4e4' stroke-width='18'/%3E%3Cpath d='M254 396c88-108 195-111 292-8' fill='none' stroke='%23c9c9c9' stroke-width='22' stroke-linecap='round'/%3E%3Cpath d='M584 238c58 21 96 58 114 110' fill='none' stroke='%23d8d8d8' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

const initialProducts: Product[] = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function isDefaultFilter(f: FilterState) {
  return f.sort === DEFAULT_FILTER.sort &&
    f.materials.length === 0 &&
    f.gauges.length === 0 &&
    f.stock === "all";
}

function parseMaterialValue(value: string): string[] {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function toggleMaterialValue(value: string, material: string): string {
  const selected = parseMaterialValue(value);
  const next = selected.includes(material)
    ? selected.filter((m) => m !== material)
    : [...selected, material];
  return next.join(",");
}

function loadInitialItems(): Product[] {
  try {
    const storedItems = window.localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!storedItems) return [];

    const parsedItems: unknown = JSON.parse(storedItems);
    return Array.isArray(parsedItems) ? parsedItems as Product[] : [];
  } catch {
    return [];
  }
}

function normalizeProductPhotoPath(value: string | null | undefined): string | undefined {
  if (!value || value === PRODUCT_PLACEHOLDER_IMAGE || value.startsWith("data:")) {
    return undefined;
  }

  const withoutQuery = value.split("?")[0];
  const markers = [
    `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`,
    `/storage/v1/object/sign/${PRODUCT_IMAGE_BUCKET}/`,
  ];

  for (const marker of markers) {
    const markerIndex = withoutQuery.indexOf(marker);
    if (markerIndex >= 0) {
      return decodeURIComponent(withoutQuery.slice(markerIndex + marker.length));
    }
  }

  return value.replace(/^\/+/, "");
}

async function createProductPhotoUrl(photoPath: string | undefined): Promise<string | undefined> {
  if (!photoPath) return undefined;

  if (/^https?:\/\//.test(photoPath)) {
    return photoPath;
  }

  try {
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .createSignedUrl(photoPath, PHOTO_SIGNED_URL_EXPIRES_IN);

    if (error) {
      console.error("Failed to create signed URL for product image.", error);
      return undefined;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Failed to create signed URL for product image.", error);
    return undefined;
  }
}

function toProduct(row: ZaikomaneItemRow): Product {
  const image = normalizeProductPhotoPath(row.photo ?? row.image);

  return {
    id: row.id,
    photo: image ?? "",
    image,
    maker: row.maker ?? "",
    productName: row.product_name ?? undefined,
    colorName: row.color_name ?? "",
    colorCode: row.color_code ?? "#8B6E52",
    material: row.material ?? "",
    gauge: row.gauge ?? "",
    quantity: row.quantity ?? 0,
    purchaseDate: row.purchase_date ?? "",
    url: row.url ?? undefined,
    notes: row.notes ?? undefined,
    weightG: row.weight_g ?? undefined,
    lengthM: row.length_m ?? undefined,
    needleMin: row.needle_min ?? undefined,
    needleMax: row.needle_max ?? undefined,
    hookMin: row.hook_min ?? undefined,
    hookMax: row.hook_max ?? undefined,
    gaugeStitches: row.gauge_stitches ?? undefined,
    gaugeRows: row.gauge_rows ?? undefined,
  };
}

async function toProductWithSignedPhoto(row: ZaikomaneItemRow): Promise<Product> {
  const product = toProduct(row);
  const photoUrl = await createProductPhotoUrl(product.photo || undefined);
  return {
    ...product,
    photoUrl,
  };
}

function toRegisterFormFromProduct(item: Product): RegisterForm {
  const imagePath = normalizeProductPhotoPath(item.image ?? item.photo);

  return {
    photoPath: imagePath ?? "",
    photoUrl: item.photoUrl ?? "",
    photoFile: null,
    photoPreview: null,
    photoError: "",
    maker: item.maker,
    productName: item.productName ?? "",
    colorName: item.colorName,
    colorCode: item.colorCode,
    material: item.material,
    gauge: item.gauge,
    weightG: item.weightG,
    lengthM: item.lengthM,
    needleMin: item.needleMin,
    needleMax: item.needleMax,
    hookMin: item.hookMin,
    hookMax: item.hookMax,
    gaugeStitches: item.gaugeStitches,
    gaugeRows: item.gaugeRows,
    quantity: item.quantity,
    purchaseDate: item.purchaseDate,
    url: item.url ?? "",
    notes: item.notes ?? "",
  };
}

function toZaikomaneItemPayload(item: Product): ZaikomaneItemPayload {
  return {
    photo: normalizeProductPhotoPath(item.photo) ?? "",
    maker: item.maker,
    product_name: item.productName || null,
    color_name: item.colorName,
    color_code: item.colorCode,
    material: item.material,
    gauge: item.gauge,
    quantity: item.quantity,
    purchase_date: item.purchaseDate || null,
    url: item.url ?? null,
    notes: item.notes ?? null,
    weight_g: item.weightG ?? null,
    length_m: item.lengthM ?? null,
    needle_min: item.needleMin ?? null,
    needle_max: item.needleMax ?? null,
    hook_min: item.hookMin ?? null,
    hook_max: item.hookMax ?? null,
    gauge_stitches: item.gaugeStitches ?? null,
    gauge_rows: item.gaugeRows ?? null,
  };
}

function toZaikomaneItemInsert(item: Product, userId: string): ZaikomaneItemInsert {
  return {
    ...toZaikomaneItemPayload(item),
    user_id: userId,
  };
}

function toZaikomaneItemUpdate(item: Product): ZaikomaneItemUpdate {
  return {
    ...toZaikomaneItemPayload(item),
    updated_at: new Date().toISOString(),
  };
}

function validateImageFile(file: File): string {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "jpg / png / webp の画像を選択してください";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "画像は5MB以下にしてください";
  }
  return "";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadProductImage(file: File, userId: string): Promise<string | null> {
  const path = `${userId}/${Date.now()}-${file.name}`;

  try {
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, file);

    if (error) {
      console.error("Failed to upload product image to Supabase Storage.", error);
      return null;
    }

    return path;
  } catch (error) {
    console.error("Failed to upload product image to Supabase Storage.", error);
    return null;
  }
}

async function deleteProductImageIfUnused(photoPath: string | undefined): Promise<void> {
  if (!photoPath || /^https?:\/\//.test(photoPath)) return;

  try {
    const { data, error } = await supabase
      .from("zaikomane_items")
      .select("id")
      .eq("photo", photoPath)
      .limit(1);

    if (error) {
      console.error("Failed to check product image references in Supabase.", error);
      return;
    }

    if ((data ?? []).length > 0) return;

    const { error: storageError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove([photoPath]);

    if (storageError) {
      console.error("Failed to delete product image from Supabase Storage.", storageError);
    }
  } catch (error) {
    console.error("Failed to delete product image from Supabase Storage.", error);
  }
}

function formatWeight(weightG?: number, lengthM?: number): string {
  if (weightG == null && lengthM == null) return "—";
  return `${weightG != null ? weightG : "-"}g / ${lengthM != null ? lengthM : "-"}m`;
}

function formatNeedleRange(min?: number, max?: number): string {
  if (min == null && max == null) return "—";
  if (min == null) return `${max}号`;
  if (max == null || min === max) return `${min}号`;
  return `${min}号 〜 ${max}号`;
}

// ─── Shared small components ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px] mb-2">
      {children}
    </p>
  );
}

function DialogSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-['Nunito',sans-serif] font-light text-xs text-foreground tracking-wide mb-3 flex items-center gap-1.5">
      {children}
    </p>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-[16px] py-[12px] h-[44px] bg-[#f2f2f2] rounded-[18px] font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
    />
  );
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (session: Session | null) => void }) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [contentMode, setContentMode] = useState<"login" | "signup">("login");
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentSwapTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (contentSwapTimeoutRef.current) {
        window.clearTimeout(contentSwapTimeoutRef.current);
      }
    };
  }, []);

  const handleSignIn = async () => {
    setMessage("");
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Failed to sign in with Supabase Auth.", error);
        setMessage("ログインできませんでした。メールアドレスとパスワードを確認してください。");
        return;
      }

      onAuthenticated(data.session);
    } catch (error) {
      console.error("Failed to sign in with Supabase Auth.", error);
      setMessage("ログインできませんでした。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setMessage("");
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Failed to sign up with Supabase Auth.", error);
        setMessage("新規登録できませんでした。入力内容を確認してください。");
        return;
      }

      onAuthenticated(data.session);
      setMessage(data.session ? "" : "確認メールを送信しました。メールを確認してください。");
    } catch (error) {
      console.error("Failed to sign up with Supabase Auth.", error);
      setMessage("新規登録できませんでした。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthModeChange = (nextMode: "login" | "signup") => {
    if (nextMode === authMode || !isContentVisible) return;

    setMessage("");
    setAuthMode(nextMode);
    setIsContentVisible(false);

    contentSwapTimeoutRef.current = window.setTimeout(() => {
      setContentMode(nextMode);
      setIsContentVisible(true);
      contentSwapTimeoutRef.current = null;
    }, 250);
  };

  const canSubmit = email.trim() !== "" && password.trim() !== "" && !isSubmitting;
  const isLoginLayout = authMode === "login";
  const isLoginContent = contentMode === "login";

  return (
    <div className="min-h-screen bg-white font-sans flex justify-center px-[20px] py-[34px]">
      <style>{`
        .auth-field:-webkit-autofill,
        .auth-field:-webkit-autofill:hover,
        .auth-field:-webkit-autofill:focus {
          transition: background-color 9999s ease-out 0s;
        }
        .auth-field-login:-webkit-autofill,
        .auth-field-login:-webkit-autofill:hover,
        .auth-field-login:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
          -webkit-text-fill-color: #0f0f0f;
        }
        .auth-field-signup:-webkit-autofill,
        .auth-field-signup:-webkit-autofill:hover,
        .auth-field-signup:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0f0f0f inset;
          -webkit-text-fill-color: #ffffff;
        }
      `}</style>
      <div className="w-full max-w-[280px]">
        <header className="mb-[18px]">
          <h1 className="font-['Megrim',sans-serif] text-[32px] leading-[32px] tracking-[-0.8px] text-[#0f0f0f] not-italic">K-TO.</h1>
        </header>
        <div className={`relative h-[490px] w-full overflow-hidden rounded-[46px] border border-[#0F0F0F] transition-colors duration-500 ${
          isLoginContent ? "bg-[#0f0f0f]" : "bg-white"
        }`}>
          <div className={`absolute left-1/2 top-[48px] z-10 w-[68%] -translate-x-1/2 transition-opacity duration-200 ${
            isLoginContent && isContentVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}>
            <button
              type="button"
              onClick={() => handleAuthModeChange("signup")}
              className="w-full cursor-pointer text-center font-['Nunito',sans-serif] text-[16px] font-light text-[#888]"
            >
              here sign-up
            </button>
          </div>

        <div className={`absolute left-1/2 bottom-[31px] z-30 w-[60%] -translate-x-1/2 transition-opacity duration-200 ${
          !isLoginContent && isContentVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}>
          <button
            type="button"
            onClick={() => handleAuthModeChange("login")}
            className="w-full cursor-pointer text-center font-['Nunito',sans-serif] text-[14px] font-light text-[#888]"
          >
            here login
          </button>
        </div>

        <section
          className={`absolute inset-x-0 z-20 transition-all duration-500 ease-out ${
            isLoginLayout ? "top-[96px] bottom-0 rounded-[46px]" : "top-0 h-[412px] rounded-[46px]"
          } ${
            isLoginContent ? "bg-white" : "bg-[#0f0f0f]"
          }`}
        >
          <div
            className={`absolute left-1/2 z-10 w-[60%] -translate-x-1/2 transition-all duration-500 ease-out ${
              isLoginContent ? "top-[86px]" : "top-[88px]"
            } ${
              isContentVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className={`w-full text-center font-['Nunito',sans-serif] font-light ${
              isLoginContent ? "text-[18px] tracking-[2px] text-[#0F0F0F]" : "text-[20px] tracking-[2px] text-white"
            }`}>
              {isLoginContent ? "LOGIN" : "SIGN-UP"}
            </p>

            <div className={isLoginContent ? "mt-[24px]" : "mt-[26px]"}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`auth-field block w-full border-0 border-b bg-transparent px-0 font-['Nunito',sans-serif] text-[18px] font-light outline-none ${
                  isLoginContent
                    ? "auth-field-login h-[30px] border-[#b8b8b8] text-[#0f0f0f] placeholder:text-[#CACACA]"
                    : "auth-field-signup h-[32px] border-[#777] text-white placeholder:text-[#888]"
                }`}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className={`auth-field block w-full border-0 border-b bg-transparent px-0 font-['Nunito',sans-serif] text-[18px] font-light outline-none ${
                  isLoginContent
                    ? "auth-field-login h-[30px] border-[#b8b8b8] text-[#0f0f0f] placeholder:text-[#CACACA]"
                    : "auth-field-signup h-[32px] border-[#777] text-white placeholder:text-[#888]"
                }`}
              />
            </div>

            {message && (
              <p className={`mt-[12px] font-['Nunito',sans-serif] text-[12px] font-light leading-[18px] ${
                isLoginContent ? "text-[#d0182a]" : "text-white/70"
              }`}>
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={isLoginContent ? handleSignIn : handleSignUp}
              disabled={!canSubmit}
              className={`w-full rounded-full border bg-transparent px-[34px] font-['Nunito',sans-serif] text-[16px] font-light transition-all duration-300 disabled:opacity-100 ${
                isLoginContent
                  ? "mt-[26px] border-[#0f0f0f] py-[10px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white"
                  : "mt-[28px] border-white py-[11px] text-white hover:bg-white hover:text-[#0f0f0f]"
              }`}
            >
              {isLoginContent ? "login" : "sign up"}
            </button>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

function SelectChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`h-[36px] px-4 rounded-full font-['Nunito',sans-serif] font-light text-[14px] leading-[20px] transition-all duration-150 ${
        selected
          ? "bg-[#0f0f0f] text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]"
          : "bg-[#f5f5f5] text-[#0f0f0f] hover:bg-[#e8e8e8]"
      }`}
    >{label}</button>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold tracking-wide">
      {label}
    </span>
  );
}

function MakerChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {SUGGESTED_MAKERS.map((m) => (
        <button key={m} type="button" onClick={() => onChange(value === m ? "" : m)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
            value === m
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >{m}</button>
      ))}
    </div>
  );
}

function ColorPicker({ colorCode, colorName, onCodeChange, onNameChange }: {
  colorCode: string; colorName: string; onCodeChange: (v: string) => void; onNameChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative cursor-pointer flex-shrink-0">
        <input type="color" value={colorCode} onChange={(e) => onCodeChange(e.target.value)} className="sr-only" />
        <div className="w-11 h-11 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-105" style={{ backgroundColor: colorCode }} />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 1v6M1 4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground" />
          </svg>
        </div>
      </label>
      <div className="flex-1">
        <TextInput value={colorName} onChange={onNameChange} placeholder="色名（例：桜ピンク）" />
      </div>
    </div>
  );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-5">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="size-[44px] rounded-full bg-[#f5f5f5] flex items-center justify-center font-['Nunito',sans-serif] font-bold text-[20px] leading-[28px] text-[#0f0f0f] hover:bg-[#e8e8e8] transition-colors active:scale-95"
      >−</button>
      <div className="text-center min-w-[3rem]">
        <span className="font-['Nunito',sans-serif] font-bold text-[30px] leading-[36px] text-[#0f0f0f]">{value}</span>
        <span className="font-['Nunito',sans-serif] font-normal text-[14px] text-[#888] ml-1">個</span>
      </div>
      <button type="button" onClick={() => onChange(value + 1)}
        className="size-[44px] rounded-full bg-[#f5f5f5] flex items-center justify-center font-['Nunito',sans-serif] font-bold text-[20px] leading-[28px] text-[#0f0f0f] hover:bg-[#e8e8e8] transition-colors active:scale-95"
      >＋</button>
    </div>
  );
}

function NumberInput({ value, onChange, placeholder }: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      placeholder={placeholder}
      min={0}
      className="w-full px-[12px] py-[12px] h-[44px] bg-[#f2f2f2] rounded-[18px] font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] text-center placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function UnitLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-['Nunito',sans-serif] font-light text-[14px] text-[#888] flex-shrink-0 leading-[20px]">{children}</span>
  );
}

function toDateValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateValue(value: string): Date | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selectedDate = parseDateValue(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayValue = toDateValue(new Date());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const moveMonth = (diff: number) => {
    setViewDate(new Date(year, month + diff, 1));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 bg-muted rounded-xl font-['Nunito',sans-serif] font-light text-[14px] text-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-ring transition-shadow flex items-center justify-between"
      >
        <span>{value ? formatDate(value) : "日付を選択"}</span>
        <span className="text-[#888] text-[12px]">calendar</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="date-picker"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-[52px] z-50 rounded-[24px] bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl p-4 font-['Nunito',sans-serif] font-light"
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="size-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#0f0f0f] hover:bg-[#e8e8e8] transition-colors"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <p className="text-[14px] leading-[20px] text-[#0f0f0f]">
                {year}/{String(month + 1).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="size-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#0f0f0f] hover:bg-[#e8e8e8] transition-colors"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="h-7 flex items-center justify-center text-[11px] text-[#888]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                if (day == null) return <div key={`empty-${index}`} className="h-9" />;

                const dateValue = toDateValue(new Date(year, month, day));
                const selected = dateValue === value;
                const today = dateValue === todayValue;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    onClick={() => {
                      onChange(dateValue);
                      setIsOpen(false);
                    }}
                    className={`h-9 rounded-full text-[13px] transition-colors ${
                      selected
                        ? "bg-[#0f0f0f] text-white"
                        : today
                          ? "border border-[#0f0f0f] text-[#0f0f0f] hover:bg-[#f5f5f5]"
                          : "text-[#0f0f0f] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GaugeHint({ gauge }: { gauge: string }) {
  if (!gauge) return null;
  return (
    <div className="mt-3 px-[12px] py-[8px] bg-[#f2f2f2] rounded-[18px] flex items-center gap-[8px]">
      <div className="rounded-full bg-[rgba(15,15,15,0.6)] flex-shrink-0"
        style={{ width: GAUGE_SIZE[gauge] ?? 8, height: GAUGE_SIZE[gauge] ?? 8 }}
      />
      <p className="font-['Nunito',sans-serif] font-light text-[12px] text-[#888] leading-[16px]">{gauge} — 糸の太さイメージ</p>
    </div>
  );
}

// ─── Active Filter Tags ───────────────────────────────────────────────────────

type FilterTag = { key: string; label: string; onRemove: () => void };

function ActiveFilterBar({ filter, resultCount, onChange }: {
  filter: FilterState;
  resultCount: number;
  onChange: (f: FilterState) => void;
}) {
  const tags: FilterTag[] = [];

  const sortOpt = SORT_OPTIONS.find((o) => o.value === filter.sort);
  if (filter.sort !== "date_desc" && sortOpt) {
    tags.push({
      key: "sort",
      label: `${sortOpt.label} ${sortOpt.sub}`,
      onRemove: () => onChange({ ...filter, sort: "date_desc" }),
    });
  }

  filter.materials.forEach((m) =>
    tags.push({ key: `mat-${m}`, label: m, onRemove: () => onChange({ ...filter, materials: filter.materials.filter((x) => x !== m) }) })
  );
  filter.gauges.forEach((g) =>
    tags.push({ key: `gauge-${g}`, label: g, onRemove: () => onChange({ ...filter, gauges: filter.gauges.filter((x) => x !== g) }) })
  );
  if (filter.stock !== "all") {
    const stockLabel = STOCK_OPTIONS.find((o) => o.value === filter.stock)?.label ?? "";
    tags.push({ key: "stock", label: stockLabel, onRemove: () => onChange({ ...filter, stock: "all" }) });
  }

  if (tags.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-none border-t border-border/50">
      <div className="flex items-center gap-2 px-4 py-2.5 w-max">
        <span className="text-[11px] font-semibold text-muted-foreground flex-shrink-0">{resultCount}件</span>
        <div className="w-px h-3 bg-border flex-shrink-0" />
        {tags.map((tag) => (
          <span key={tag.key} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex-shrink-0">
            {tag.label}
            <button onClick={tag.onRemove} className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
        <button
          onClick={() => onChange(DEFAULT_FILTER)}
          className="text-[11px] text-muted-foreground hover:text-foreground font-semibold flex-shrink-0 px-1 underline underline-offset-2"
        >
          リセット
        </button>
      </div>
    </div>
  );
}

// ─── Filter Dialog ────────────────────────────────────────────────────────────

function FilterDialog({ isOpen, filter, resultCount, onChange, onClose }: {
  isOpen: boolean;
  filter: FilterState;
  resultCount: number;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}) {
  const toggleMaterial = (m: string) => {
    const next = filter.materials.includes(m)
      ? filter.materials.filter((x) => x !== m)
      : [...filter.materials, m];
    onChange({ ...filter, materials: next });
  };

  const toggleGauge = (g: string) => {
    const next = filter.gauges.includes(g)
      ? filter.gauges.filter((x) => x !== g)
      : [...filter.gauges, g];
    onChange({ ...filter, gauges: next });
  };

  const activeCount =
    (filter.sort !== "date_desc" ? 1 : 0) +
    filter.materials.length +
    filter.gauges.length +
    (filter.stock !== "all" ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="filter-sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-3xl z-50 flex flex-col shadow-2xl font-['Nunito',sans-serif] font-light"
            style={{ maxHeight: "88dvh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-['Nunito',sans-serif] text-base font-light text-foreground">絞り込み・並び替え</h2>
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-light flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange(DEFAULT_FILTER)}
                className="text-xs font-light text-muted-foreground hover:text-destructive transition-colors px-1 disabled:opacity-30"
                disabled={isDefaultFilter(filter)}
              >
                リセット
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7">

              {/* ── 並び替え ── */}
              <section>
                <DialogSectionLabel>
                  <ArrowUpDown size={13} className="text-muted-foreground" />
                  並び替え
                </DialogSectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ ...filter, sort: opt.value })}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                        filter.sort === opt.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-light leading-tight">{opt.label}</p>
                        <p className={`text-[10px] leading-tight mt-0.5 ${filter.sort === opt.value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {opt.sub}
                        </p>
                      </div>
                      {filter.sort === opt.value && (
                        <Check size={14} className="flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── 材質 ── */}
              <section>
                <DialogSectionLabel>材質</DialogSectionLabel>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMaterial(m)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-light transition-all ${
                        filter.materials.includes(m)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {filter.materials.includes(m) && <Check size={12} />}
                      {m}
                    </button>
                  ))}
                </div>
                {filter.materials.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filter, materials: [] })}
                    className="mt-2 text-[11px] text-muted-foreground hover:text-foreground font-light"
                  >
                    選択をクリア
                  </button>
                )}
              </section>

              {/* ── ゲージ ── */}
              <section>
                <DialogSectionLabel>ゲージ</DialogSectionLabel>
                <div className="flex flex-wrap gap-2">
                  {GAUGES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGauge(g)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-light transition-all ${
                        filter.gauges.includes(g)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {filter.gauges.includes(g) && <Check size={12} />}
                      {g}
                    </button>
                  ))}
                </div>
                {/* Gauge thickness visual guide */}
                <div className="mt-3 flex items-end gap-2 px-1">
                  {GAUGES.map((g) => (
                    <div key={g} className="flex flex-col items-center gap-1">
                      <div
                        className={`rounded-full transition-colors ${filter.gauges.includes(g) ? "bg-primary" : "bg-border"}`}
                        style={{ width: GAUGE_SIZE[g], height: GAUGE_SIZE[g] }}
                      />
                      <span className="text-[9px] text-muted-foreground">{g}</span>
                    </div>
                  ))}
                </div>
                {filter.gauges.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filter, gauges: [] })}
                    className="mt-2 text-[11px] text-muted-foreground hover:text-foreground font-light"
                  >
                    選択をクリア
                  </button>
                )}
              </section>

              {/* ── 在庫状態 ── */}
              <section>
                <DialogSectionLabel>在庫状態</DialogSectionLabel>
                <div className="flex gap-2">
                  {STOCK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ ...filter, stock: opt.value })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-light transition-all ${
                        filter.stock === opt.value
                          ? opt.value === "low"
                            ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                            : "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-card">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl border-[0.2px] border-black bg-transparent text-[#0f0f0f] font-light text-sm tracking-wide hover:bg-[#0f0f0f] hover:text-white active:scale-[0.98] transition-all duration-150"
              >
                {resultCount}件を表示
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Edit Screen ──────────────────────────────────────────────────────────────

function EditScreen({ item, onBack, onSave, onDelete, userId }: {
  item: Product; onBack: () => void; onSave: (u: Product) => void; onDelete: () => void; userId: string | null;
}) {
  const [form, setForm] = useState<EditForm>({
    photoPath: normalizeProductPhotoPath(item.image ?? item.photo) ?? "",
    photoUrl: item.photoUrl ?? "",
    photoFile: null,
    photoPreview: null,
    photoError: "",
    maker: item.maker, productName: item.productName ?? "", colorName: item.colorName, colorCode: item.colorCode,
    material: item.material, gauge: item.gauge,
    weightG: item.weightG, lengthM: item.lengthM,
    needleMin: item.needleMin, needleMax: item.needleMax,
    hookMin: item.hookMin, hookMax: item.hookMax,
    gaugeStitches: item.gaugeStitches, gaugeRows: item.gaugeRows,
    quantity: item.quantity, purchaseDate: item.purchaseDate,
    url: item.url ?? "", notes: item.notes ?? "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const displayPhoto = form.photoPreview ?? form.photoUrl;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setForm((prev) => ({ ...prev, photoFile: null, photoError: error }));
      e.target.value = "";
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, photoFile: file, photoPreview: dataUrl, photoError: "" }));
  };

  const handleSave = async () => {
    let image = form.photoPath || undefined;

    if (form.photoFile) {
      if (!userId) {
        console.error("Failed to upload product image. No authenticated user.");
        return;
      }

      const uploadedPath = await uploadProductImage(form.photoFile, userId);
      if (!uploadedPath) return;
      image = uploadedPath;
    }

    onSave({
      ...item,
      photo: image || "",
      image: image || undefined,
      maker: form.maker, productName: form.productName || undefined, colorName: form.colorName, colorCode: form.colorCode,
      material: form.material, gauge: form.gauge,
      weightG: form.weightG, lengthM: form.lengthM,
      needleMin: form.needleMin, needleMax: form.needleMax,
      hookMin: form.hookMin, hookMax: form.hookMax,
      gaugeStitches: form.gaugeStitches, gaugeRows: form.gaugeRows,
      quantity: form.quantity, purchaseDate: form.purchaseDate,
      url: form.url || undefined, notes: form.notes || undefined,
    });
  };

  const handleClose = () => {
    onBack();
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoPath: "", photoFile: null, photoPreview: null, photoUrl: "", photoError: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSave = (form.colorName.trim() !== "" || displayPhoto !== "") && Number.isFinite(form.quantity);

  return (
    <motion.div
      key="edit"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed inset-0 z-40 bg-background overflow-y-auto"
    >
      <div className="max-w-lg mx-auto min-h-full flex flex-col">
        <header className="sticky top-0 z-10 bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-b-[1.278px] border-[rgba(0,0,0,0.08)] flex-shrink-0">
          <div className="flex items-center justify-between px-[16px] py-[12px]">
            <button type="button" onClick={handleClose} className="flex items-center gap-[4px] text-[#0f0f0f] hover:opacity-70 transition-opacity">
              <ChevronLeft size={20} strokeWidth={1.5} />
              <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">cancel</span>
            </button>
            <span className="font-['Nunito',sans-serif] font-light text-[16px] leading-[24px] text-[#0f0f0f]">Edit-mode</span>
            <button type="button" onClick={handleSave} disabled={!canSave}
              className="flex items-center border-[0.2px] border-black rounded-full px-[12.2px] py-[6.2px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors disabled:opacity-40"
            >
              <span className="font-['Nunito',sans-serif] font-light text-[12px] leading-[16px]">save</span>
            </button>
          </div>
        </header>

        <div className="px-5 py-6 space-y-7 flex-1">
          <section>
            <FieldLabel>画像</FieldLabel>
            <div className="relative w-full bg-[#f2f2f2] rounded-[20px] overflow-hidden cursor-pointer" style={{ height: "236px" }} onClick={() => fileInputRef.current?.click()}>
              {displayPhoto ? (
                <img src={displayPhoto} alt="プレビュー" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#888] gap-2">
                  <Camera size={22} />
                  <p className="font-['Nunito',sans-serif] font-light text-[12px]">写真を追加</p>
                </div>
              )}
              <div className="absolute bottom-[12px] right-[12px] flex items-center gap-[6px] px-[12px] py-[6px] rounded-full bg-[rgba(0,0,0,0.5)]">
                <Camera size={12} color="white" />
                <span className="font-['Nunito',sans-serif] font-semibold text-[12px] leading-[16px] text-white">変更</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            {displayPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-2 text-[12px] font-['Nunito',sans-serif] font-light text-[#d0182a] hover:opacity-70 transition-opacity"
              >
                画像を削除
              </button>
            )}
            {form.photoError && (
              <p className="mt-2 font-['Nunito',sans-serif] font-light text-[12px] text-[#d0182a] leading-[16px]">{form.photoError}</p>
            )}
          </section>

          <section>
            <FieldLabel>メーカー名</FieldLabel>
            <TextInput value={form.maker} onChange={(v) => set("maker", v)} placeholder="例：manufacturer name" />
          </section>

          <section>
            <FieldLabel>毛糸名称</FieldLabel>
            <TextInput value={form.productName} onChange={(v) => set("productName", v)} placeholder="例：毛糸名称" />
          </section>

          <section>
            <FieldLabel>色</FieldLabel>
            <ColorPicker colorCode={form.colorCode} colorName={form.colorName} onCodeChange={(v) => set("colorCode", v)} onNameChange={(v) => set("colorName", v)} />
          </section>

          <section>
            <FieldLabel>材質</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map((m) => (
                <SelectChip
                  key={m}
                  label={m}
                  selected={parseMaterialValue(form.material).includes(m)}
                  onClick={() => set("material", toggleMaterialValue(form.material, m))}
                />
              ))}
            </div>
          </section>

          <section>
            <FieldLabel>ゲージ</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {GAUGES.map((g) => <SelectChip key={g} label={g} selected={form.gauge === g} onClick={() => set("gauge", form.gauge === g ? "" : g)} />)}
            </div>
            <GaugeHint gauge={form.gauge} />
          </section>

          <section>
            <FieldLabel>重量</FieldLabel>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <NumberInput value={form.weightG} onChange={(v) => set("weightG", v)} placeholder="例：40" />
              <UnitLabel>g</UnitLabel>
              <NumberInput value={form.lengthM} onChange={(v) => set("lengthM", v)} placeholder="例：120" />
              <UnitLabel>m</UnitLabel>
            </div>
          </section>

          <section>
            <FieldLabel>棒針</FieldLabel>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <NumberInput value={form.needleMin} onChange={(v) => set("needleMin", v)} placeholder="例：7" />
              <UnitLabel>号 〜</UnitLabel>
              <NumberInput value={form.needleMax} onChange={(v) => set("needleMax", v)} placeholder="例：8" />
              <UnitLabel>号</UnitLabel>
            </div>
          </section>

          <section>
            <FieldLabel>かぎ針</FieldLabel>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <NumberInput value={form.hookMin} onChange={(v) => set("hookMin", v)} placeholder="例：6" />
              <UnitLabel>号 〜</UnitLabel>
              <NumberInput value={form.hookMax} onChange={(v) => set("hookMax", v)} placeholder="例：7" />
              <UnitLabel>号</UnitLabel>
            </div>
          </section>

          <section>
            <FieldLabel>メリヤス編み標準ゲージ</FieldLabel>
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <NumberInput value={form.gaugeStitches} onChange={(v) => set("gaugeStitches", v)} placeholder="例：15" />
              <UnitLabel>目</UnitLabel>
              <NumberInput value={form.gaugeRows} onChange={(v) => set("gaugeRows", v)} placeholder="例：20" />
              <UnitLabel>段</UnitLabel>
            </div>
          </section>

          <section>
            <FieldLabel>個数</FieldLabel>
            <QuantityStepper value={form.quantity} onChange={(v) => set("quantity", v)} />
          </section>

          <section>
            <FieldLabel>購入日</FieldLabel>
            <DatePicker value={form.purchaseDate} onChange={(v) => set("purchaseDate", v)} />
          </section>

          <section>
            <FieldLabel>URL</FieldLabel>
            <TextInput value={form.url} onChange={(v) => set("url", v)} placeholder="例：https://..." type="url" />
          </section>

          <section>
            <FieldLabel>備考</FieldLabel>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="例：用途・購入場所・メモなど"
              rows={3}
              className="w-full px-4 py-3 bg-muted rounded-xl font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
            />
          </section>

          <div className="h-2" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      key="edit" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed inset-0 z-40 bg-white overflow-y-auto"
    >
      <div className="max-w-lg mx-auto min-h-full flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-b-[1.278px] border-[rgba(0,0,0,0.08)] flex-shrink-0">
          <div className="flex items-center justify-between px-[16px] py-[12px]">
            <button type="button" onClick={onBack} className="flex items-center gap-[4px] text-[#0f0f0f] hover:opacity-70 transition-opacity">
              <ChevronLeft size={20} strokeWidth={1.5} />
              <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">cancel</span>
            </button>
            <span className="font-['Nunito',sans-serif] font-light text-[16px] leading-[24px] text-[#0f0f0f]">edit-mode</span>
            <button type="button" onClick={handleSave} disabled={!canSave}
              className="flex items-center border-[0.2px] border-black rounded-full px-[12.2px] py-[6.2px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors disabled:opacity-40"
            >
              <span className="font-['Nunito',sans-serif] font-light text-[12px] leading-[16px]">save</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-[20px] py-[24px] flex-1 flex flex-col gap-[28px]">

          {/* 画像 */}
          <section>
            <FieldLabel>画像</FieldLabel>
            <div className="relative w-full bg-[#f2f2f2] rounded-[20px] overflow-hidden cursor-pointer mt-2" style={{ height: "236px" }} onClick={() => fileInputRef.current?.click()}>
              {displayPhoto ? (
                <img src={displayPhoto} alt="プレビュー" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#888] gap-2">
                  <Camera size={22} />
                  <p className="font-['Nunito',sans-serif] font-light text-[12px]">写真を追加</p>
                </div>
              )}
              <div className="absolute bottom-[12px] right-[12px] flex items-center gap-[6px] px-[12px] py-[6px] rounded-full bg-[rgba(0,0,0,0.5)]">
                <Camera size={12} color="white" />
                <span className="font-['Nunito',sans-serif] font-semibold text-[12px] leading-[16px] text-white">変更</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </section>

          {/* メーカー名 */}
          <section>
            <FieldLabel>メーカー名</FieldLabel>
            <TextInput value={form.maker} onChange={(v) => set("maker", v)} placeholder="例：manufacturer name" />
          </section>

          <section>
            <FieldLabel>毛糸名称</FieldLabel>
            <TextInput value={form.productName} onChange={(v) => set("productName", v)} placeholder="例：毛糸名称" />
          </section>

          {/* 色 */}
          <section>
            <FieldLabel>色</FieldLabel>
            <div className="flex gap-[12px] items-center mt-2">
              <label className="relative cursor-pointer flex-shrink-0">
                <input type="color" value={form.colorCode} onChange={(e) => set("colorCode", e.target.value)} className="sr-only" />
                <div className="size-[44px] rounded-[18px] border-[1.278px] border-[rgba(0,0,0,0.08)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" style={{ backgroundColor: form.colorCode }} />
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white border-[1.278px] border-[rgba(0,0,0,0.08)] flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M4 1v6M1 4h6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </label>
              <div className="flex-1">
                <TextInput value={form.colorName} onChange={(v) => set("colorName", v)} placeholder="色名（例：桜ピンク）" />
              </div>
            </div>
          </section>

          {/* 材質 */}
          <section>
            <FieldLabel>材質</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {MATERIALS.map((m) => (
                <SelectChip
                  key={m}
                  label={m}
                  selected={parseMaterialValue(form.material).includes(m)}
                  onClick={() => set("material", toggleMaterialValue(form.material, m))}
                />
              ))}
            </div>
          </section>

          {/* ゲージ */}
          <section>
            <FieldLabel>ゲージ</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {GAUGES.map((g) => (
                <SelectChip key={g} label={g} selected={form.gauge === g} onClick={() => set("gauge", form.gauge === g ? "" : g)} />
              ))}
            </div>
            <GaugeHint gauge={form.gauge} />
          </section>

          {/* 重量 */}
          <section>
            <FieldLabel>重量</FieldLabel>
            <div className="flex items-center gap-[8px] mt-2">
              <NumberInput value={form.weightG} onChange={(v) => set("weightG", v)} placeholder="例：100" />
              <UnitLabel>g</UnitLabel>
              <NumberInput value={form.lengthM} onChange={(v) => set("lengthM", v)} placeholder="例：200" />
              <UnitLabel>m</UnitLabel>
            </div>
          </section>

          {/* 棒針 */}
          <section>
            <FieldLabel>棒針</FieldLabel>
            <div className="flex items-center gap-[8px] mt-2">
              <NumberInput value={form.needleMin} onChange={(v) => set("needleMin", v)} placeholder="例：4" />
              <UnitLabel>号 〜</UnitLabel>
              <NumberInput value={form.needleMax} onChange={(v) => set("needleMax", v)} placeholder="例：5" />
              <UnitLabel>号</UnitLabel>
            </div>
          </section>

          {/* かぎ針 */}
          <section>
            <FieldLabel>かぎ針</FieldLabel>
            <div className="flex items-center gap-[8px] mt-2">
              <NumberInput value={form.hookMin} onChange={(v) => set("hookMin", v)} placeholder="例：5" />
              <UnitLabel>号 〜</UnitLabel>
              <NumberInput value={form.hookMax} onChange={(v) => set("hookMax", v)} placeholder="例：6" />
              <UnitLabel>号</UnitLabel>
            </div>
          </section>

          {/* メリヤス編み標準ゲージ */}
          <section>
            <FieldLabel>メリヤス編み標準ゲージ</FieldLabel>
            <div className="flex items-center gap-[8px] mt-2">
              <NumberInput value={form.gaugeStitches} onChange={(v) => set("gaugeStitches", v)} placeholder="例：20" />
              <UnitLabel>目</UnitLabel>
              <NumberInput value={form.gaugeRows} onChange={(v) => set("gaugeRows", v)} placeholder="例：28" />
              <UnitLabel>段</UnitLabel>
            </div>
          </section>

          {/* 個数 */}
          <section>
            <FieldLabel>個数</FieldLabel>
            <div className="mt-2">
              <QuantityStepper value={form.quantity} onChange={(v) => set("quantity", v)} />
            </div>
          </section>

          {/* 購入日 */}
          <section>
            <FieldLabel>購入日</FieldLabel>
            <input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)}
              className="w-full px-[16px] h-[44px] bg-[#f2f2f2] rounded-[18px] font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-ring transition-shadow mt-2"
            />
          </section>

          {/* URL */}
          <section>
            <FieldLabel>URL</FieldLabel>
            <TextInput value={form.url} onChange={(v) => set("url", v)} placeholder="例：https://..." type="url" />
          </section>

          {/* 備考 */}
          <section>
            <FieldLabel>備考</FieldLabel>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="例：用途・購入場所・メモなど" rows={4}
              className="w-full px-[16px] py-[12px] bg-[#f2f2f2] rounded-[18px] font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
            />
          </section>

          {/* 削除 */}
          <div className="pt-[9.278px] pb-[40px] border-t-[1.278px] border-[rgba(0,0,0,0.08)]">
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div key="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  <p className="font-['Nunito',sans-serif] font-light text-xs text-center text-[#888] pb-1">削除すると元に戻せません。本当に削除しますか？</p>
                  <button type="button" onClick={onDelete}
                    className="w-full py-[12.2px] rounded-[18px] bg-[#d0182a] text-white font-['Nunito',sans-serif] font-light text-[14px] hover:opacity-90 transition-opacity"
                  >削除する</button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    className="w-full py-[12.2px] rounded-[18px] bg-[#f2f2f2] text-[#0f0f0f] font-['Nunito',sans-serif] font-light text-[14px] hover:bg-[#e8e8e8] transition-colors"
                  >キャンセル</button>
                </motion.div>
              ) : (
                <motion.button key="delete-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  type="button" onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-[18px] border-[0.2px] border-[#d0182a] py-[12.2px] flex items-center justify-center gap-[8px] text-[#d0182a] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                  <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">この毛糸を削除する</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Screen ────────────────────────────────────────────────────────────

function DetailScreen({ item, onBack, onEdit, onCopy, onDelete }: {
  item: Product; onBack: () => void; onEdit: () => void; onCopy: () => void; onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOne = item.quantity === 1;
  const productPhotoUrl = item.photoUrl;

  return (
    <motion.div
      key="detail" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed inset-0 z-30 bg-white overflow-y-auto"
    >
      <div className="max-w-lg mx-auto min-h-full flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-b-[1.278px] border-[rgba(0,0,0,0.08)] flex-shrink-0">
          <div className="flex items-center justify-between px-[16px] py-[12px]">
            <button onClick={onBack} className="flex items-center gap-[4px] text-[#0f0f0f] hover:opacity-70 transition-opacity">
              <ChevronLeft size={20} strokeWidth={1.5} />
              <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">return</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="flex items-center gap-[6px] border-[0.2px] border-black rounded-full px-[12.2px] py-[6.2px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors">
                <Pencil size={13} strokeWidth={1.5} />
                <span className="font-['Nunito',sans-serif] font-light text-[12px] leading-[16px]">edit</span>
              </button>
              <button onClick={onCopy} className="flex items-center gap-[6px] border-[0.2px] border-black rounded-full px-[12.2px] py-[6.2px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors">
                <Copy size={13} strokeWidth={1.5} />
                <span className="font-['Nunito',sans-serif] font-light text-[12px] leading-[16px]">copy</span>
              </button>
            </div>
          </div>
        </header>

        {/* Image */}
        <div className="relative h-[265px] bg-[#f2f2f2] flex-shrink-0 overflow-hidden">
          {productPhotoUrl
            ? <img src={productPhotoUrl} alt={`${item.maker} ${item.colorName}`} className="absolute inset-0 size-full object-cover" />
            : <div className="w-full h-full" style={{ backgroundColor: item.colorCode }} />
          }
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent" />
        </div>

        {/* White content panel — overlaps image by 20px */}
        <div className="-mt-[20px] bg-white rounded-tl-[30px] rounded-tr-[30px] relative z-10 px-[20px] pt-[24px] pb-[48px] flex-1">

          {/* Maker */}
          <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">{item.maker}</p>

          {item.productName && (
            <p className="mt-[6px] font-['Nunito',sans-serif] font-light text-[14px] text-[#0f0f0f] leading-[20px]">{item.productName}</p>
          )}

          {/* Color dot + name */}
          <div className="flex gap-[10px] items-center mt-[10px]">
            <div
              className="rounded-full shrink-0 size-[20px] border-[1.278px] border-[rgba(0,0,0,0.1)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
              style={{ backgroundColor: item.colorCode }}
            />
            <p className="font-['Nunito',sans-serif] font-light text-[20px] text-[#0f0f0f] leading-[30px]">{item.colorName}</p>
          </div>

          {/* Tags */}
          <div className="flex gap-[10px] items-center mt-[10px] max-w-full overflow-x-auto overflow-y-hidden scrollbar-none">
            {parseMaterialValue(item.material).map((material) => (
              <div key={material} className="bg-[#f2f2f2] rounded-full px-[10px] py-[4px] shrink-0">
                <p className="font-['Nunito',sans-serif] font-light text-[10px] text-[#888] tracking-[0.275px] leading-[16.5px] whitespace-nowrap">{material}</p>
              </div>
            ))}
            {item.gauge && (
              <div className="bg-[#f2f2f2] rounded-full px-[10px] py-[4px] shrink-0">
                <p className="font-['Nunito',sans-serif] font-light text-[10px] text-[#888] tracking-[0.275px] leading-[16.5px] whitespace-nowrap">{item.gauge}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mt-[24px] border-t-[1.278px] border-[rgba(0,0,0,0.08)]" />

          {/* 個数 + 購入日 */}
          <div className="mt-[24px] grid grid-cols-2 gap-[16px]">
            {/* 個数 */}
            <div className={`rounded-[30px] p-[16.5px] border-[0.5px] ${isOne ? "border-[#f5006a]" : "border-[rgba(0,0,0,0.08)]"}`}>
              <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">個数</p>
              <div className="mt-[8px] flex items-baseline gap-[4px]">
                <span className={`font-['Nunito',sans-serif] font-light text-[36px] leading-[40px] ${isOne ? "text-[#f5006a]" : "text-[#0f0f0f]"}`}>{item.quantity}</span>
                <span className={`font-['Nunito',sans-serif] font-light text-[14px] leading-[20px] ${isOne ? "text-[#f5006a]" : "text-[#0f0f0f]"}`}>個</span>
              </div>
            </div>

            {/* 購入日 */}
            <div className="rounded-[16px] p-[16px]">
              <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">購入日</p>
              <p className="mt-[8px] font-['Nunito',sans-serif] font-light text-[14px] text-[#0f0f0f] leading-[22.75px]">{formatDate(item.purchaseDate)}</p>
            </div>
          </div>

          {/* スペック */}
          <div className="mt-[24px]">
            <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">スペック</p>
            <div className="mt-[8px] bg-white rounded-[20px] overflow-hidden">
              <div className="flex items-center justify-between px-[16px] pt-[12px] pb-[12.5px] border-b-[0.5px] border-[rgba(0,0,0,0.08)]">
                <span className="font-['Nunito',sans-serif] font-light text-[12px] text-[#888] leading-[16px]">重量</span>
                <span className="font-['Nunito',sans-serif] font-semibold text-[14px] text-[#0f0f0f] leading-[20px]">
                  {formatWeight(item.weightG, item.lengthM)}
                </span>
              </div>
              <div className="flex items-center justify-between px-[16px] pt-[12px] pb-[12.5px] border-b-[0.5px] border-[rgba(0,0,0,0.08)]">
                <span className="font-['Nunito',sans-serif] font-light text-[12px] text-[#888] leading-[16px]">棒針</span>
                <span className="font-['Nunito',sans-serif] font-semibold text-[14px] text-[#0f0f0f] leading-[20px]">
                  {formatNeedleRange(item.needleMin, item.needleMax)}
                </span>
              </div>
              <div className="flex items-center justify-between px-[16px] pt-[12px] pb-[12.5px] border-b-[0.5px] border-[rgba(0,0,0,0.08)]">
                <span className="font-['Nunito',sans-serif] font-light text-[12px] text-[#888] leading-[16px]">かぎ針</span>
                <span className="font-['Nunito',sans-serif] font-semibold text-[14px] text-[#0f0f0f] leading-[20px]">
                  {formatNeedleRange(item.hookMin, item.hookMax)}
                </span>
              </div>
              <div className="flex items-center justify-between px-[16px] py-[12px]">
                <span className="font-['Nunito',sans-serif] font-light text-[12px] text-[#888] leading-[16px]">メリヤス編み標準ゲージ</span>
                <span className="font-['Nunito',sans-serif] font-semibold text-[14px] text-[#0f0f0f] leading-[20px]">
                  {item.gaugeStitches != null ? `${item.gaugeStitches}目 × ${item.gaugeRows != null ? item.gaugeRows : "-"}段` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* URL */}
          {(item.url || true) && (
            <div className="mt-[24px]">
              <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">URL</p>
              <a href={item.url || undefined} target={item.url ? "_blank" : undefined} rel="noopener noreferrer"
                className="mt-[8px] flex items-center gap-[8px] px-[16px] py-[14px] bg-[#f2f2f2] rounded-[20px] hover:bg-[#e8e8e8] transition-colors"
              >
                <ExternalLink size={14} strokeWidth={1.5} className="flex-shrink-0 text-[#888]" />
                <span className="font-['Nunito',sans-serif] font-light text-[14px] text-[#0f0f0f] leading-[22.75px] truncate">{item.url || "—"}</span>
              </a>
            </div>
          )}

          {/* 備考 */}
          {(item.notes || true) && (
            <div className="mt-[24px]">
              <p className="font-['Nunito',sans-serif] font-light text-[11px] text-[#888] tracking-[1.1px] uppercase leading-[16.5px]">備考</p>
              <div className="mt-[8px] bg-white rounded-[20px] px-[16px] py-[14px]">
                <p className="font-['Nunito',sans-serif] font-light text-[14px] text-[#0f0f0f] leading-[22.75px] whitespace-pre-wrap">{item.notes || "—"}</p>
              </div>
            </div>
          )}

          {/* Delete */}
          <div className="mt-[24px] pt-[17.278px] border-t-[1.278px] border-[rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full rounded-[20px] border-[0.2px] border-[#d0182a] py-[12.2px] flex items-center justify-center gap-[8px] text-[#d0182a] hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} strokeWidth={1.5} />
              <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">この毛糸を削除する</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              key="delete-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setConfirmDelete(false)}
            />
            <motion.div
              key="delete-dialog"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="fixed left-4 right-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-[24px] bg-white p-5 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
            >
              <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-red-50 text-[#d0182a]">
                <AlertCircle size={22} strokeWidth={1.7} />
              </div>
              <h2 id="delete-dialog-title" className="text-center font-['Nunito',sans-serif] text-[16px] font-semibold leading-[24px] text-[#0f0f0f]">
                この毛糸を削除しますか？
              </h2>
              <p className="mt-2 text-center font-['Nunito',sans-serif] text-[12px] font-light leading-[18px] text-[#888]">
                削除すると元に戻せません。
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full rounded-[20px] bg-[#d0182a] py-[12.2px] font-['Nunito',sans-serif] text-[14px] font-light text-white transition-opacity hover:opacity-90"
                >
                  削除する
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="w-full rounded-[20px] bg-[#f2f2f2] py-[12.2px] font-['Nunito',sans-serif] text-[14px] font-light text-[#0f0f0f] transition-colors hover:bg-[#e8e8e8]"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Register Modal ───────────────────────────────────────────────────────────

function RegisterModal({ isOpen, onClose, onSave, userId, initialForm, isCopyMode = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Product) => void;
  userId: string | null;
  initialForm?: RegisterForm | null;
  isCopyMode?: boolean;
}) {
  const [form, setForm] = useState<RegisterForm>(INITIAL_REGISTER_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const displayPhoto = form.photoPreview ?? form.photoUrl;

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialForm ?? INITIAL_REGISTER_FORM);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [isOpen, initialForm]);

  const handleClose = () => {
    setForm(INITIAL_REGISTER_FORM);
    onClose();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setForm((prev) => ({ ...prev, photoFile: null, photoError: error }));
      e.target.value = "";
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, photoFile: file, photoPreview: dataUrl, photoError: "" }));
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoPath: "", photoUrl: "", photoFile: null, photoPreview: null, photoError: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!userId) {
      console.error("Failed to insert zaikomane_items into Supabase. No authenticated user.");
      return;
    }

    let image = form.photoPath || undefined;

    if (form.photoFile) {
      const uploadedPath = await uploadProductImage(form.photoFile, userId);
      if (!uploadedPath) return;
      image = uploadedPath;
    }

    const newItem: Product = {
      id: "",
      photo: image ?? "",
      image,
      maker: form.maker,
      productName: form.productName || undefined,
      colorName: form.colorName,
      colorCode: form.colorCode,
      material: form.material,
      gauge: form.gauge,
      weightG: form.weightG,
      lengthM: form.lengthM,
      needleMin: form.needleMin,
      needleMax: form.needleMax,
      hookMin: form.hookMin,
      hookMax: form.hookMax,
      gaugeStitches: form.gaugeStitches,
      gaugeRows: form.gaugeRows,
      quantity: form.quantity,
      purchaseDate: form.purchaseDate,
      url: form.url || undefined,
      notes: form.notes || undefined,
    };

    try {
      const { data, error } = await supabase
        .from("zaikomane_items")
        .insert(toZaikomaneItemInsert(newItem, userId))
        .select("*")
        .single();

      if (error) {
        console.error("Failed to insert zaikomane_items into Supabase.", error);
        return;
      }

      if (!data) {
        console.error("Failed to insert zaikomane_items into Supabase. No data returned.");
        return;
      }

      onSave(await toProductWithSignedPhoto(data as ZaikomaneItemRow));
      setForm(INITIAL_REGISTER_FORM);
      onClose();
    } catch (error) {
      console.error("Failed to insert zaikomane_items into Supabase.", error);
    }
  };

  const canSave = (form.colorName.trim() !== "" || displayPhoto !== "") && Number.isFinite(form.quantity);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reg-screen"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          className="fixed inset-0 z-40 bg-background overflow-y-auto"
        >
          <div className="max-w-lg mx-auto min-h-full flex flex-col">
            <header className="sticky top-0 z-10 bg-[rgba(255,255,255,0.9)] backdrop-blur-md border-b-[1.278px] border-[rgba(0,0,0,0.08)] flex-shrink-0">
              <div className="flex items-center justify-between px-[16px] py-[12px]">
                <button type="button" onClick={handleClose} className="flex items-center gap-[4px] text-[#0f0f0f] hover:opacity-70 transition-opacity">
                  <ChevronLeft size={20} strokeWidth={1.5} />
                  <span className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px]">cancel</span>
                </button>
                <span className="font-['Nunito',sans-serif] font-light text-[16px] leading-[24px] text-[#0f0f0f]">
                  {isCopyMode ? "Copy-registration" : "Registration-mode"}
                </span>
                <button type="button" onClick={handleSave} disabled={!canSave}
                  className="flex items-center border-[0.2px] border-black rounded-full px-[12.2px] py-[6.2px] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors disabled:opacity-100"
                >
                  <span className="font-['Nunito',sans-serif] font-light text-[12px] leading-[16px]">save</span>
                </button>
              </div>
            </header>

            <div className="px-5 py-6 space-y-7 flex-1">
              <section>
                <FieldLabel>画像</FieldLabel>
                <div className="relative w-full bg-[#f2f2f2] rounded-[20px] overflow-hidden cursor-pointer" style={{ height: "236px" }} onClick={() => fileInputRef.current?.click()}>
                  {displayPhoto ? (
                    <img src={displayPhoto} alt="プレビュー" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#888] gap-2">
                      <Camera size={22} />
                      <p className="font-['Nunito',sans-serif] font-light text-[12px]">写真を追加</p>
                    </div>
                  )}
                  <div className="absolute bottom-[12px] right-[12px] flex items-center gap-[6px] px-[12px] py-[6px] rounded-full bg-[rgba(0,0,0,0.5)]">
                    <Camera size={12} color="white" />
                    <span className="font-['Nunito',sans-serif] font-semibold text-[12px] leading-[16px] text-white">選択</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                {displayPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-2 text-[12px] font-['Nunito',sans-serif] font-light text-[#d0182a] hover:opacity-70 transition-opacity"
                  >
                    画像を削除
                  </button>
                )}
                {form.photoError && (
                  <p className="mt-2 font-['Nunito',sans-serif] font-light text-[12px] text-[#d0182a] leading-[16px]">{form.photoError}</p>
                )}
              </section>

              <section>
                <FieldLabel>メーカー名</FieldLabel>
                <TextInput value={form.maker} onChange={(v) => set("maker", v)} placeholder="例：manufacturer name" />
              </section>

              <section>
                <FieldLabel>毛糸名称</FieldLabel>
                <TextInput value={form.productName} onChange={(v) => set("productName", v)} placeholder="例：毛糸名称" />
              </section>

              <section>
                <FieldLabel>色</FieldLabel>
                <ColorPicker colorCode={form.colorCode} colorName={form.colorName} onCodeChange={(v) => set("colorCode", v)} onNameChange={(v) => set("colorName", v)} />
              </section>

              <section>
                <FieldLabel>材質</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((m) => (
                    <SelectChip
                      key={m}
                      label={m}
                      selected={parseMaterialValue(form.material).includes(m)}
                      onClick={() => set("material", toggleMaterialValue(form.material, m))}
                    />
                  ))}
                </div>
              </section>

              <section>
                <FieldLabel>ゲージ</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {GAUGES.map((g) => <SelectChip key={g} label={g} selected={form.gauge === g} onClick={() => set("gauge", form.gauge === g ? "" : g)} />)}
                </div>
                <GaugeHint gauge={form.gauge} />
              </section>

              <section>
                <FieldLabel>スペック</FieldLabel>
                <div className="space-y-7">
                  <section>
                    <FieldLabel>重量</FieldLabel>
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                      <NumberInput value={form.weightG} onChange={(v) => set("weightG", v)} placeholder="例：40" />
                      <UnitLabel>g</UnitLabel>
                      <NumberInput value={form.lengthM} onChange={(v) => set("lengthM", v)} placeholder="例：120" />
                      <UnitLabel>m</UnitLabel>
                    </div>
                  </section>

                  <section>
                    <FieldLabel>棒針</FieldLabel>
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                      <NumberInput value={form.needleMin} onChange={(v) => set("needleMin", v)} placeholder="例：7" />
                      <UnitLabel>号 〜</UnitLabel>
                      <NumberInput value={form.needleMax} onChange={(v) => set("needleMax", v)} placeholder="例：8" />
                      <UnitLabel>号</UnitLabel>
                    </div>
                  </section>

                  <section>
                    <FieldLabel>かぎ針</FieldLabel>
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                      <NumberInput value={form.hookMin} onChange={(v) => set("hookMin", v)} placeholder="例：6" />
                      <UnitLabel>号 〜</UnitLabel>
                      <NumberInput value={form.hookMax} onChange={(v) => set("hookMax", v)} placeholder="例：7" />
                      <UnitLabel>号</UnitLabel>
                    </div>
                  </section>

                  <section>
                    <FieldLabel>メリヤス編み標準ゲージ</FieldLabel>
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                      <NumberInput value={form.gaugeStitches} onChange={(v) => set("gaugeStitches", v)} placeholder="例：15" />
                      <UnitLabel>目</UnitLabel>
                      <NumberInput value={form.gaugeRows} onChange={(v) => set("gaugeRows", v)} placeholder="例：20" />
                      <UnitLabel>段</UnitLabel>
                    </div>
                  </section>
                </div>

                <div className="pt-7">
                  <FieldLabel>個数</FieldLabel>
                  <QuantityStepper value={form.quantity} onChange={(v) => set("quantity", v)} />
                </div>
              </section>

              <section>
                <FieldLabel>購入日</FieldLabel>
                <DatePicker value={form.purchaseDate} onChange={(v) => set("purchaseDate", v)} />
              </section>

              <section>
                <FieldLabel>URL</FieldLabel>
                <TextInput value={form.url} onChange={(v) => set("url", v)} placeholder="例：https://..." type="url" />
              </section>

              <section>
                <FieldLabel>備考</FieldLabel>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="例：用途・購入場所・メモなど"
                  rows={3}
                  className="w-full px-4 py-3 bg-muted rounded-xl font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                />
              </section>

              <div className="h-2" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── List components ──────────────────────────────────────────────────────────

function YarnCard({ item, onClick }: { item: Product; onClick: () => void }) {
  const isOne = item.quantity === 1;
  const productPhotoUrl = item.photoUrl;
  return (
    <div
      onClick={onClick}
      className="h-[305px] bg-white border-[1.226px] border-[rgba(0,0,0,0.08)] border-solid overflow-hidden relative rounded-[30px] cursor-pointer transition-all duration-200"
    >
      {/* Image area */}
      <div className="h-[150px] w-full bg-[#f2f2f2] relative">
        {productPhotoUrl
          ? <img src={productPhotoUrl} alt={`${item.maker} ${item.colorName}`} className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" loading="lazy" />
          : <div className="w-full h-full" style={{ backgroundColor: item.colorCode }} />
        }
        {/* Quantity badge */}
        <div className="absolute right-[9px] top-[7.77px] bg-[rgba(255,247,237,0.9)] rounded-full flex items-center justify-center size-[20px]">
          <span
            className="text-[11px] font-medium leading-none text-center"
            style={{ color: isOne ? "#f5006a" : "#0f0f0f" }}
          >
            {item.quantity}
          </span>
        </div>
      </div>

      {/* Info panel — overlaps image with rounded top corners */}
      <div className="-mt-[29px] bg-white rounded-tl-[30px] rounded-tr-[30px] relative z-10 px-[20px] pt-[25px] pb-[25px] flex flex-col gap-[10px] min-w-0">
        {/* Maker */}
        <p className="font-['Nunito',sans-serif] font-light leading-[15px] text-[#888] text-[10px] tracking-[1px] uppercase whitespace-nowrap">{item.maker}</p>

        {item.productName && (
          <p className="font-['Nunito',sans-serif] font-light text-[#0f0f0f] text-[11px] leading-[17.5px] truncate">{item.productName}</p>
        )}

        {/* Color dot + name */}
        <div className="flex gap-[6px] items-center min-w-0">
          <div className="rounded-full shrink-0 size-[10px] border border-black/10" style={{ backgroundColor: item.colorCode }} />
          <p className="font-['Nunito',sans-serif] font-light text-[#0f0f0f] text-[11px] leading-[17.5px] truncate">{item.colorName}</p>
        </div>

        {/* Stock count */}
        <p className="font-['Nunito',sans-serif] font-light text-[#0f0f0f] text-[10px] leading-[17.5px] whitespace-nowrap">
          在庫　{item.quantity}個
        </p>

        {/* Tags */}
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div
            className="w-full max-w-full overflow-x-scroll overflow-y-hidden whitespace-nowrap scrollbar-none overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex min-w-max items-center gap-[6px] h-[25px]">
              {parseMaterialValue(item.material).map((material) => (
                <div key={material} className="bg-[#f2f2f2] h-full rounded-full shrink-0 flex items-center">
                  <div className="flex items-center p-[4px]">
                    <p className="font-['Nunito',sans-serif] font-light leading-[16.5px] text-[#888] text-[9px] tracking-[0.275px] whitespace-nowrap">{material}</p>
                  </div>
                </div>
              ))}
              {item.gauge && (
                <div className="bg-[#f2f2f2] h-full rounded-full shrink-0 flex items-center">
                  <div className="flex items-center p-[4px]">
                    <p className="font-['Nunito',sans-serif] font-light leading-[16.5px] text-[#888] text-[9px] tracking-[0.275px] whitespace-nowrap">{item.gauge}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Package size={26} className="text-muted-foreground" />
      </div>
      <p className="text-foreground font-semibold">{hasFilter ? "条件に合う在庫がありません" : "在庫がありません"}</p>
      <p className="text-muted-foreground text-sm mt-1">
        {hasFilter ? "絞り込み条件を変更してみてください" : "＋ボタンから毛糸を登録しましょう"}
      </p>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [items, setItems] = useState<Product[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [hasLoadedInitialItems, setHasLoadedInitialItems] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [copyRegisterForm, setCopyRegisterForm] = useState<RegisterForm | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Failed to get Supabase Auth session.", error);
          setSession(null);
          return;
        }

        setSession(data.session);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to get Supabase Auth session.", error);
        setSession(null);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    initializeSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setItems([]);
      setIsItemsLoading(false);
      setHasLoadedInitialItems(false);
      setSelectedItem(null);
      setEditingItem(null);
      setCopyRegisterForm(null);
      setIsRegisterOpen(false);
      return;
    }

    let isMounted = true;

    async function fetchInitialItems() {
      setIsItemsLoading(true);

      try {
        const { data, error } = await supabase
          .from("zaikomane_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error("Failed to fetch zaikomane_items from Supabase.", error);
          setItems(loadInitialItems());
          return;
        }

        const products = await Promise.all(
          ((data ?? []) as ZaikomaneItemRow[]).map(toProductWithSignedPhoto)
        );
        setItems(products);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch zaikomane_items from Supabase.", error);
        setItems(loadInitialItems());
      } finally {
        if (isMounted) {
          setIsItemsLoading(false);
          setHasLoadedInitialItems(true);
        }
      }
    }

    fetchInitialItems();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!hasLoadedInitialItems) return;

    try {
      window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // LocalStorage can fail in private browsing or when storage quota is exceeded.
    }
  }, [hasLoadedInitialItems, items]);

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || [item.maker, item.colorName, item.material, item.gauge, item.notes ?? ""]
        .some((s) => s.toLowerCase().includes(q));
      const itemMaterials = parseMaterialValue(item.material);
      const matchesMaterial = filter.materials.length === 0 || filter.materials.some((m) => itemMaterials.includes(m));
      const matchesGauge = filter.gauges.length === 0 || filter.gauges.includes(item.gauge);
      const matchesStock =
        filter.stock === "all" ||
        (filter.stock === "low" && item.quantity <= 2) ||
        (filter.stock === "enough" && item.quantity > 2);
      return matchesSearch && matchesMaterial && matchesGauge && matchesStock;
    });

    return [...result].sort((a, b) => {
      switch (filter.sort) {
        case "date_desc": return b.purchaseDate.localeCompare(a.purchaseDate);
        case "date_asc":  return a.purchaseDate.localeCompare(b.purchaseDate);
        case "qty_desc":  return b.quantity - a.quantity;
        case "qty_asc":   return a.quantity - b.quantity;
        case "maker":     return a.maker.localeCompare(b.maker, "ja");
        case "color":     return a.colorName.localeCompare(b.colorName, "ja");
        default:          return 0;
      }
    });
  }, [items, search, filter]);

  const selectedProduct = selectedItem
    ? items.find((item) => item.id === selectedItem.id) ?? selectedItem
    : null;
  const editingProduct = editingItem
    ? items.find((item) => item.id === editingItem.id) ?? editingItem
    : null;

  const handleStartEdit = () => {
    if (!selectedProduct) return;
    setEditingItem({ ...selectedProduct });
  };

  const handleStartCopy = () => {
    if (!selectedProduct) return;
    setCopyRegisterForm(toRegisterFormFromProduct(selectedProduct));
    setIsRegisterOpen(true);
  };

  const handleOpenRegister = () => {
    setCopyRegisterForm(null);
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
    setCopyRegisterForm(null);
  };

  const handleSaveEdit = async (updated: Product) => {
    if (!editingItem) return;

    try {
      const { data, error } = await supabase
        .from("zaikomane_items")
        .update(toZaikomaneItemUpdate(updated))
        .eq("id", editingItem.id)
        .select("*")
        .single();

      if (error) {
        console.error("Failed to update zaikomane_items in Supabase.", error);
        return;
      }

      if (!data) {
        console.error("Failed to update zaikomane_items in Supabase. No data returned.");
        return;
      }

      const updatedItem = await toProductWithSignedPhoto(data as ZaikomaneItemRow);
      setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
      setSelectedItem((prev) => (prev?.id === updatedItem.id ? updatedItem : prev));
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update zaikomane_items in Supabase.", error);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("zaikomane_items")
        .delete()
        .eq("id", product.id);

      if (error) {
        console.error("Failed to delete zaikomane_items from Supabase.", error);
        return;
      }

      const photoPath = normalizeProductPhotoPath(product.photo);
      await deleteProductImageIfUnused(photoPath);

      setItems((prev) => prev.filter((item) => item.id !== product.id));
      setEditingItem(null);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to delete zaikomane_items from Supabase.", error);
    }
  };

  const handleRegisterSave = (newItem: Product) => {
    setItems((prev) => [newItem, ...prev]);
    if (copyRegisterForm) {
      setSelectedItem(newItem);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Failed to sign out from Supabase Auth.", error);
        return;
      }

        setSession(null);
        setItems([]);
        setIsItemsLoading(false);
        setSelectedItem(null);
        setEditingItem(null);
        setCopyRegisterForm(null);
        setIsRegisterOpen(false);
    } catch (error) {
      console.error("Failed to sign out from Supabase Auth.", error);
    }
  };

  const hasActiveFilter = !isDefaultFilter(filter) || search.trim().length > 0;
  const shouldShowEmptyState = !isItemsLoading && hasLoadedInitialItems && filtered.length === 0;
  const filterBadgeCount =
    (filter.sort !== "date_desc" ? 1 : 0) +
    filter.materials.length +
    filter.gauges.length +
    (filter.stock !== "all" ? 1 : 0);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <p className="font-['Nunito',sans-serif] font-light text-[14px] leading-[20px] text-[#888]">loading...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onAuthenticated={setSession} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-lg mx-auto relative">

        {/* ── List header ── */}
        <header className="sticky top-0 z-20 bg-[rgba(255,255,255,0.95)] backdrop-blur-md border-b border-[rgba(0,0,0,0.08)]">
          <div className="px-[16px] pt-[24px] pb-[12px]">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-['Megrim',sans-serif] text-[32px] leading-[32px] tracking-[-0.8px] text-[#0f0f0f] not-italic">k-to.</h1>
                <p className="font-['Nunito',sans-serif] font-normal text-[12px] leading-[16px] text-[#888] mt-[6px]">
                  {filtered.length}点の在庫
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="h-[36px] px-3 rounded-full border-[0.2px] border-black bg-transparent text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors font-['Nunito',sans-serif] font-light text-[12px]"
              >
                logout
              </button>
            </div>

            {/* Search bar */}
            <div className="mt-[16px] flex items-center gap-2">
              <div className="relative flex-1">
              <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
              <input
                type="text"
                placeholder="ブランド・色・素材で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-[36px] pr-9 h-[40px] bg-[#f5f5f5] rounded-[18px] font-['Nunito',sans-serif] font-light text-[16px] sm:text-[14px] text-[#0f0f0f] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              )}
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`relative w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors ${
                  filterBadgeCount > 0
                    ? "bg-primary text-primary-foreground"
                    : "border-[0.2px] border-black bg-transparent text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white"
                }`}
                aria-label="絞り込み・並び替え"
              >
                <SlidersHorizontal size={16} />
                {filterBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-foreground text-[9px] font-bold text-primary flex items-center justify-center ring-2 ring-background">
                    {filterBadgeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          <ActiveFilterBar filter={filter} resultCount={filtered.length} onChange={setFilter} />
        </header>

        {/* ── Card grid ── */}
        <main className="px-[25px] pt-[25px] pb-[135px]">
          {shouldShowEmptyState ? (
            <EmptyState hasFilter={hasActiveFilter} />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-5">
              {filtered.map((item) => (
                <YarnCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          ) : null}
        </main>

        {/* FAB */}
        <button
          onClick={handleOpenRegister}
          // className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-20"
          className="fixed bottom-6 right-6 sm:right-[calc((100vw-520px)/2+24px)] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-20"
          aria-label="毛糸を登録"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Filter dialog ── */}
      <FilterDialog
        isOpen={isFilterOpen}
        filter={filter}
        resultCount={filtered.length}
        onChange={setFilter}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* ── Detail screen ── */}
      <AnimatePresence>
        {selectedProduct && !editingProduct && (
          <DetailScreen
            key={selectedProduct.id}
            item={selectedProduct}
            onBack={() => setSelectedItem(null)}
            onEdit={handleStartEdit}
            onCopy={handleStartCopy}
            onDelete={() => handleDeleteProduct(selectedProduct)}
          />
        )}
      </AnimatePresence>

      {/* ── Edit screen ── */}
      <AnimatePresence>
        {editingProduct && (
          <EditScreen
            key={`edit-${editingProduct.id}`}
            item={editingProduct}
            onBack={() => setEditingItem(null)}
            onSave={handleSaveEdit}
            onDelete={() => handleDeleteProduct(editingProduct)}
            userId={session.user.id}
          />
        )}
      </AnimatePresence>

      {/* ── Register modal ── */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onSave={handleRegisterSave}
        userId={session.user.id}
        initialForm={copyRegisterForm}
        isCopyMode={copyRegisterForm !== null}
      />
    </div>
  );
}
