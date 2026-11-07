import { useRef, useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  CaseSensitive,
  Download,
  Database,
  User,
  Info,
  Palette,
  Languages,
  Type,
  SunMoon,
  Check,
  ChevronDown,
  Upload,
  Sparkles,
  Bot,
  ExternalLink,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import {
  useAppearance,
  FONT_SIZES,
  DEFAULT_FONT_SIZE,
} from "../context/AppearanceContext";
import { useToast } from "../context/ToastContext";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useStreakPosts } from "../hooks/useStreakPosts";
import { useTimeStreak } from "../hooks/useTimeStreak";
import { exportPostsAs, POST_COLUMNS, toPlainPost } from "../utils/postExport";
import { IMPORT_ACCEPT, mapRecordsToPosts, parseDataFile } from "../utils/importData";
import {
  exportToCsv,
  exportToExcel,
  exportToJson,
  timestampSuffix,
} from "../utils/exportData";
import { formatDateOnly, formatFullDateTime } from "../utils/date";
import { COLOR_OPTIONS, DEFAULT_COLOR } from "../theme/palette";
import { DEFAULT_FONT, FONT_OPTIONS } from "../theme/fonts";
import { LANGUAGES } from "../i18n";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Segmented from "../components/ui/Segmented";
import BrandMark from "../components/BrandMark";
import ExportMenu from "../components/ExportMenu";
import UserCard from "../components/UserCard";

const AUTHOR_NAME = "minhtrong67";
const AUTHOR_GITHUB = "https://github.com/minhtrong67";

/**
 * Thẻ cài đặt. Với `collapsible`, tiêu đề trở thành nút mở/đóng (accordion) và `summary`
 * hiện giá trị đang chọn khi thẻ đang thu gọn, để người dùng thấy ngay mà không cần mở.
 */
function SettingsCard({ title, hint, icon: Icon, children, delay = 0, collapsible = false, defaultOpen = true, summary }) {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = !collapsible || open;
  const header = (
    <>
      {Icon && (
        <span className="flex items-center justify-center w-11 h-11 rounded-[16px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shrink-0">
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0 flex-1 text-left">
        <h2 className="text-lg font-bold tracking-tight text-[var(--md-on-surface)]">{title}</h2>
        {hint && (!collapsible || open) && (
          <p className="text-sm text-[var(--md-on-surface-variant)] mt-0.5">{hint}</p>
        )}
        {collapsible && !open && summary && (
          <div className="mt-1 text-sm font-semibold text-[var(--md-primary)] flex items-center gap-2 min-w-0">{summary}</div>
        )}
      </div>
      {collapsible && (
        <ChevronDown
          size={22}
          className={`shrink-0 text-[var(--md-on-surface-variant)] transition-transform duration-300 ease-[var(--ease-spring)] ${open ? "rotate-180" : ""}`}
        />
      )}
    </>
  );

  return (
    <section
      className="stagger-item rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] p-5 sm:p-6"
      style={{ "--stagger-delay": `${delay}ms` }}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="m3-ripple -m-2 p-2 rounded-[20px] flex w-full items-start gap-3.5"
        >
          {header}
        </button>
      ) : (
        <div className="flex items-start gap-3.5">{header}</div>
      )}
      <div className={`accordion ${expanded ? "accordion-open" : ""}`} inert={!expanded}>
        <div>
          <div className="pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Ô chọn màu chủ đề: vòng tròn màu seed, dấu tích bật lên khi được chọn. */
function ColorSwatch({ option, active, label, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.key)}
      aria-pressed={active}
      title={label}
      className="m3-ripple group flex flex-col items-center gap-1.5 rounded-[20px] py-2 px-1 transition-colors"
    >
      <span
        style={{ backgroundColor: option.hex }}
        className={`flex items-center justify-center w-12 h-12 transition-all duration-500 ease-[var(--ease-spring)] ${active
            ? "rounded-[16px] scale-105 ring-4 ring-offset-2 ring-offset-[var(--md-surface-container-low)] ring-[var(--md-on-surface)]"
            : "rounded-full group-hover:rounded-[16px]"
          }`}
      >
        {active && (
          <Check
            size={22}
            strokeWidth={3}
            className="anim-pop text-white drop-shadow"
          />
        )}
      </span>
      <span
        className={`text-[11px] leading-tight text-center line-clamp-2 ${active
            ? "font-bold text-[var(--md-on-surface)]"
            : "text-[var(--md-on-surface-variant)]"
          }`}
      >
        {label}
      </span>
    </button>
  );
}

/** Hàng chọn font: hiển thị mẫu chữ bằng chính font đó. */
function FontRow({ option, active, name, sample, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(option.key)}
      className={`m3-ripple w-full flex items-center gap-3 px-5 py-3 text-left transition-[border-radius,background-color,color] duration-300 ease-[var(--ease-spring)] ${active
          ? "rounded-[24px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]"
          : "rounded-[14px] bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)]"
        }`}
    >
      <span className="min-w-0 flex-1" style={{ fontFamily: option.stack }}>
        <span className="block text-base font-bold truncate">{name}</span>
        <span className="block text-xs opacity-75 truncate">{sample}</span>
      </span>
      {active && <Check size={20} strokeWidth={3} className="anim-pop shrink-0" />}
    </button>
  );
}

export default function Settings() {
  const { t, lang, setLang } = useLang();
  const toast = useToast();
  const { theme, setTheme, colorKey, setColor } = useTheme();
  const { fontSize, setFontSize, font, setFont } = useAppearance();
  const { installed, canPrompt, promptInstall } = usePwaInstall();
  const { items: posts, bulkCreate } = useStreakPosts();
  const { streak } = useTimeStreak();
  const [resetOpen, setResetOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) toast.success(t("settings.installed"));
  };

  /** Nhập nhật ký từ CSV / JSON / Excel. Dòng trùng được ghi đè, dòng lỗi bị bỏ qua và được báo lại. */
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng một tệp
    if (!file) return;
    setImporting(true);
    try {
      const records = await parseDataFile(file);
      const { valid, invalid } = mapRecordsToPosts(records);
      if (!valid.length) {
        toast.error(records.length ? t("csv.importError") : t("csv.importEmpty"));
        return;
      }
      const { inserted, updated } = await bulkCreate(valid);
      if (invalid === 0)
        toast.success(t("csv.importSuccess", { count: inserted + updated, updated }));
      else
        toast.warning(t("csv.importPartial", { count: inserted + updated, failed: invalid }));
    } catch {
      toast.error(t("csv.importError"));
    } finally {
      setImporting(false);
    }
  };

  /** Đặt lại giao diện về mặc định (không đụng tới ngôn ngữ và dữ liệu). */
  const handleReset = () => {
    setTheme("system");
    setColor(DEFAULT_COLOR);
    setFontSize(DEFAULT_FONT_SIZE);
    setFont(DEFAULT_FONT);
    toast.success(t("settings.resetDone"));
  };

  const themeOptions = [
    { value: "light", icon: Sun, label: t("theme.light") },
    { value: "dark", icon: Moon, label: t("theme.dark") },
    { value: "system", icon: Monitor, label: t("theme.system") },
  ];

  const sizeOptions = Object.keys(FONT_SIZES).map((key) => ({
    value: key,
    label: (
      <span
        style={{
          fontSize: key === "sm" ? "0.85em" : key === "lg" ? "1.2em" : "1em",
        }}
      >
        {t(`settings.fontSizeLabels.${key}`)}
      </span>
    ),
  }));

  const languageOptions = LANGUAGES.map((code) => ({
    value: code,
    label: t(`lang.${code}`),
  }));

  /**
   * Xuất toàn bộ dữ liệu. JSON và Excel gồm cả mốc thời gian lẫn nhật ký,
   * các định dạng còn lại gồm toàn bộ nhật ký.
   */
  const handleExportAll = async (format) => {
    if (!posts.length && !streak) {
      toast.warning(t("csv.exportEmpty"));
      return;
    }
    try {
      const columns = POST_COLUMNS.map((c) => ({
        ...c,
        label: t(c.labelKey),
        value: (r) => c.get(r, t),
      }));
      const sorted = [...posts].sort((a, b) =>
        `${b.post_date} ${b.post_time}`.localeCompare(
          `${a.post_date} ${a.post_time}`,
        ),
      );
      const stamp = timestampSuffix();
      const base = `streak-logger-${t("exportDoc.fileSlug.all")}`;

      if (format === "json") {
        exportToJson(
          {
            exportedAt: new Date().toISOString(),
            timeStreak: streak
              ? {
                title: streak.title,
                start_at: streak.start_at,
                note: streak.note || null,
              }
              : null,
            streakPosts: sorted.map(toPlainPost),
          },
          `${base}-${stamp}.json`,
        );
      } else if (format === "excel") {
        const streakColumns = [
          { label: t("timeStreak.fieldTitle"), value: (r) => r.title },
          {
            label: t("timeStreak.milestone"),
            value: (r) => formatFullDateTime(r.start_at),
          },
          { label: t("timeStreak.fieldNote"), value: (r) => r.note || "" },
        ];
        await exportToExcel(
          [
            { name: t("streakPost.title"), columns, rows: sorted },
            {
              name: t("timeStreak.title"),
              columns: streakColumns,
              rows: streak ? [streak] : [],
            },
          ],
          `${base}-${stamp}.xlsx`,
        );
      } else if (format === "csv") {
        exportToCsv(
          sorted,
          columns,
          `${base}-${stamp}.csv`,
        );
      } else {
        if (!sorted.length) {
          toast.warning(t("csv.exportEmpty"));
          return;
        }
        const result = await exportPostsAs(
          format,
          sorted,
          columns,
          t("streakPost.title"),
          t("exportDoc.fileSlug.allSuffix"),
        );
        if (result?.truncated) {
          toast.warning(t("csv.exportTruncated", { count: result.truncated }));
          return;
        }
      }
      toast.success(t("csv.exportSuccess"));
    } catch {
      toast.error(t("csv.exportError"));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        actions={
          <Button
            variant="danger"
            className="w-full"
            icon={RotateCcw}
            onClick={() => setResetOpen(true)}
          >
            {t("settings.reset")}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 max-w-3xl">
        <SettingsCard
          title={t("auth.account")}
          hint={t("auth.accountHint")}
          icon={User}
          delay={0}
        >
          <UserCard />
        </SettingsCard>

        {/* Thẻ cài đặt app chỉ hiện khi người dùng chưa cài. */}
        {!installed && (
          <SettingsCard
            title={t("settings.installApp")}
            hint={t("settings.installAppHint")}
            icon={Download}
            delay={40}
          >
            {canPrompt ? (
              <Button icon={Download} onClick={handleInstall}>
                {t("settings.installNow")}
              </Button>
            ) : (
              <p className="text-sm text-[var(--md-on-surface-variant)]">
                {t("settings.installNotSupported")}
              </p>
            )}
          </SettingsCard>
        )}

        <SettingsCard
          title={t("settings.appearance")}
          hint={t("settings.appearanceHint")}
          icon={SunMoon}
          delay={80}
        >
          <Segmented
            ariaLabel={t("settings.appearance")}
            value={theme}
            onChange={setTheme}
            options={themeOptions}
          />
        </SettingsCard>

        <SettingsCard
          title={t("settings.colorTheme")}
          hint={t("settings.colorThemeHint")}
          icon={Palette}
          delay={110}
          collapsible
          defaultOpen={false}
          summary={
            <>
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: COLOR_OPTIONS.find((c) => c.key === colorKey)?.hex }}
              />
              <span className="truncate">{t(`settings.colorLabels.${colorKey}`)}</span>
            </>
          }
        >
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-1 gap-y-1">
            {COLOR_OPTIONS.map((option) => (
              <ColorSwatch
                key={option.key}
                option={option}
                active={colorKey === option.key}
                label={t(`settings.colorLabels.${option.key}`)}
                onSelect={setColor}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.fontSize")}
          hint={t("settings.fontSizeHint")}
          icon={CaseSensitive}
          delay={140}
        >
          <Segmented
            ariaLabel={t("settings.fontSize")}
            value={fontSize}
            onChange={setFontSize}
            options={sizeOptions}
          />
        </SettingsCard>

        <SettingsCard
          title={t("settings.font")}
          hint={t("settings.fontHint")}
          icon={Type}
          delay={170}
          collapsible
          defaultOpen={false}
          summary={
            <span
              className="truncate"
              style={{ fontFamily: FONT_OPTIONS.find((f) => f.key === font)?.stack }}
            >
              {FONT_OPTIONS.find((f) => f.key === font)?.name || t("settings.fontSystem")}
            </span>
          }
        >
          <div role="radiogroup" aria-label={t("settings.font")} className="flex flex-col gap-1.5">
            {FONT_OPTIONS.map((option) => (
              <FontRow
                key={option.key}
                option={option}
                active={font === option.key}
                name={option.name || t("settings.fontSystem")}
                sample={t("settings.fontSample")}
                onSelect={setFont}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.language")}
          hint={t("settings.languageHint")}
          icon={Languages}
          delay={200}
        >
          <Segmented
            ariaLabel={t("settings.language")}
            value={lang}
            onChange={setLang}
            options={languageOptions}
          />
        </SettingsCard>

        <SettingsCard
          title={t("settings.data")}
          hint={t("settings.dataHint")}
          icon={Database}
          delay={230}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="tonal"
              icon={Upload}
              loading={importing}
              onClick={() => fileRef.current?.click()}
              className="w-full"
            >
              {importing ? t("common.importing") : t("settings.importJournal")}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept={IMPORT_ACCEPT}
              className="hidden"
              onChange={handleImportFile}
            />
            <ExportMenu
              variant="primary"
              label={t("settings.exportAll")}
              onExport={handleExportAll}
              className="w-full"
            />
          </div>
          <p className="text-xs text-[var(--md-on-surface-variant)] mt-3">
            {t("settings.importHint")} {t("settings.exportAllHint")}
          </p>
          <p className="text-xs text-[var(--md-on-surface-variant)] mt-3 tabular">
            {posts.length} {t("stats.entries")}
            {streak
              ? ` · ${t("timeStreak.milestone")}: ${formatDateOnly(streak.start_at)}`
              : ""}
          </p>
        </SettingsCard>

        <SettingsCard title={t("settings.about")} icon={Info} delay={260}>
          <p className="text-sm text-[var(--md-on-surface-variant)]">
            {t("settings.aboutBody")}
          </p>
        </SettingsCard>

        {/* Thông tin tác giả: luôn nằm cuối cùng và được làm nổi bật bằng nền gradient chủ đề. */}
        <section
          aria-label={t("settings.author")}
          className="stagger-item relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--md-primary-container)] to-[var(--md-tertiary-container)] text-[var(--md-on-primary-container)] p-6 sm:p-8"
          style={{ "--stagger-delay": "290ms" }}
        >
          <BrandMark
            size={220}
            className="absolute -right-12 -bottom-14 opacity-20 anim-float pointer-events-none"
          />
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={14} />
            {t("settings.author")}
          </p>
          <p className="mt-4 text-sm opacity-90">{t("settings.authorBuiltBy")}</p>
          <p className="display-title text-3xl sm:text-4xl break-all">{AUTHOR_NAME}</p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-[20px] bg-[color-mix(in_oklab,var(--md-surface)_55%,transparent)] pl-3 pr-5 py-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-[var(--md-primary)] text-[var(--md-on-primary)] shrink-0">
              <Bot size={20} />
            </span>
            <span className="leading-tight">
              <span className="block text-xs opacity-85">{t("settings.authorAiLabel")}</span>
              <span className="block text-sm font-bold">{t("settings.authorAiName")}</span>
            </span>
          </div>

          <div className="mt-5">
            <Button
              as="a"
              href={AUTHOR_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              icon={ExternalLink}
            >
              {t("settings.authorGithub")}
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title={t("settings.resetTitle")}
        body={t("settings.resetBody")}
        confirmLabel={t("settings.reset")}
        confirmIcon={RotateCcw}
        tone="warning"
      />
    </div>
  );
}
