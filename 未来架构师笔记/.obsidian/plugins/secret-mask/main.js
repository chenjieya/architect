var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SecretMaskPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");
var DEFAULT_SETTINGS = {
  prefixDigits: 3,
  suffixDigits: 4,
  maskChar: "*"
};
var CODE_REGEX = /^sdk:(.+)$/;
function maskValue(value, settings) {
  const { prefixDigits, suffixDigits, maskChar } = settings;
  if (value.length <= prefixDigits + suffixDigits) {
    return value;
  }
  const prefix = value.slice(0, prefixDigits);
  const suffix = value.slice(-suffixDigits);
  const maskLength = value.length - prefixDigits - suffixDigits;
  return prefix + maskChar.repeat(maskLength) + suffix;
}
var MaskWidget = class extends import_view.WidgetType {
  constructor(masked, full) {
    super();
    this.masked = masked;
    this.full = full;
  }
  toDOM() {
    const span = createSpan("secret-mask");
    span.textContent = this.masked;
    span.setAttribute("data-full-number", this.full);
    return span;
  }
  eq(other) {
    return this.masked === other.masked && this.full === other.full;
  }
  ignoreEvent() {
    return false;
  }
};
var SecretMaskPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !target.classList)
        return;
      if (target.classList.contains("secret-mask")) {
        const fullNumber = target.getAttribute("data-full-number");
        if (fullNumber)
          this.showTooltip(e, fullNumber);
      } else {
        this.hideTooltip();
      }
    };
    this.handleMouseOut = (e) => {
      const target = e.target;
      if (!target || !target.classList)
        return;
      if (target.classList.contains("secret-mask")) {
        this.hideTooltip();
      }
    };
    this.handleScroll = () => {
      this.hideTooltip();
    };
    this.handleCopy = (e) => {
      var _a, _b, _c;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0)
        return;
      const range = selection.getRangeAt(0);
      let plainText = selection.toString();
      let hadMask = false;
      document.querySelectorAll(".secret-mask").forEach((el) => {
        const maskedText = el.textContent || "";
        const full = el.getAttribute("data-full-number");
        if (!maskedText || !full || !range.intersectsNode(el))
          return;
        if (plainText.includes(maskedText)) {
          plainText = plainText.split(maskedText).join(full);
          hadMask = true;
        }
      });
      const mdView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      const editorSelection = (_c = (_b = (_a = mdView == null ? void 0 : mdView.editor) == null ? void 0 : _a.getSelection) == null ? void 0 : _b.call(_a)) != null ? _c : "";
      if (editorSelection && (/`sdk:[^`]+`/.test(editorSelection) || !plainText.replace(/\s/g, ""))) {
        plainText = editorSelection;
      }
      const hasWrapper = /`sdk:[^`]+`/.test(plainText);
      const cleaned = plainText.replace(/`sdk:([^`]+)`/g, "$1");
      if (e.clipboardData && cleaned.length && (hadMask || hasWrapper)) {
        e.preventDefault();
        e.clipboardData.setData("text/plain", cleaned);
      }
    };
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SecretMaskSettingTab(this.app, this));
    this.registerMarkdownPostProcessor((el, ctx) => this.processReadingView(el));
    this.registerEditorExtension(import_state.Prec.highest(this.buildLivePreviewPlugin()));
    window.addEventListener("mouseover", this.handleMouseOver, true);
    window.addEventListener("mouseout", this.handleMouseOut, true);
    window.addEventListener("copy", this.handleCopy, true);
    window.addEventListener("scroll", this.handleScroll, true);
    this.register(() => {
      window.removeEventListener("mouseover", this.handleMouseOver, true);
      window.removeEventListener("mouseout", this.handleMouseOut, true);
      window.removeEventListener("copy", this.handleCopy, true);
      window.removeEventListener("scroll", this.handleScroll, true);
    });
  }
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data != null ? data : {});
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  processReadingView(el, ctx) {
    const codeElements = el.querySelectorAll("code");
    codeElements.forEach((code) => {
      const text = (code.textContent || "").trim();
      const match = text.match(CODE_REGEX);
      if (!match)
        return;
      const fullNumber = match[1];
      const masked = maskValue(fullNumber, this.settings);
      const span = createSpan("secret-mask");
      span.textContent = masked;
      span.setAttribute("data-full-number", fullNumber);
      code.replaceWith(span);
    });
  }
  buildLivePreviewPlugin() {
    const mask = (value) => maskValue(value, this.settings);
    return import_view.ViewPlugin.fromClass(class {
      constructor(view) {
        this.decorations = this.buildDecorations(view);
      }
      update(update) {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      buildDecorations(view) {
        const decorations = [];
        const selection = view.state.selection;
        const overlapsSelection = (from, to) => {
          for (let i = 0; i < selection.ranges.length; i++) {
            const r = selection.ranges[i];
            if (r.from <= to && r.to >= from)
              return true;
          }
          return false;
        };
        for (const { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          const regex = /`sdk:([^`]+)`/g;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const fullNumber = match[1];
            const start = from + match.index;
            const end = start + match[0].length;
            if (overlapsSelection(start, end))
              continue;
            decorations.push(
              import_view.Decoration.replace({
                widget: new MaskWidget(mask(fullNumber), fullNumber)
              }).range(start, end)
            );
          }
        }
        return import_view.Decoration.set(decorations);
      }
    }, {
      decorations: (v) => v.decorations
    });
  }
  showTooltip(e, text) {
    this.hideTooltip();
    const tooltip = createDiv("secret-mask-tooltip");
    tooltip.id = "secret-mask-tooltip";
    tooltip.textContent = text;
    tooltip.setCssProps({
      left: `${e.clientX}px`,
      top: `${e.clientY - 30}px`
    });
    document.body.appendChild(tooltip);
  }
  hideTooltip() {
    const tooltip = document.getElementById("secret-mask-tooltip");
    if (tooltip)
      tooltip.remove();
  }
};
var SecretMaskSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  getSettingDefinitions() {
    return [
      {
        name: "Prefix digits",
        desc: "Number of characters to show at the beginning.",
        control: {
          type: "number",
          key: "prefixDigits",
          defaultValue: DEFAULT_SETTINGS.prefixDigits,
          min: 0,
          step: 1
        }
      },
      {
        name: "Suffix digits",
        desc: "Number of characters to show at the end.",
        control: {
          type: "number",
          key: "suffixDigits",
          defaultValue: DEFAULT_SETTINGS.suffixDigits,
          min: 0,
          step: 1
        }
      },
      {
        name: "Mask character",
        desc: "Character used to mask the middle part.",
        control: {
          type: "text",
          key: "maskChar",
          defaultValue: DEFAULT_SETTINGS.maskChar
        }
      }
    ];
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Prefix digits").setDesc("Number of digits to show at the beginning").addText((text) => text.setPlaceholder("3").setValue(String(this.plugin.settings.prefixDigits)).onChange(async (value) => {
      this.plugin.settings.prefixDigits = parseInt(value) || 3;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Suffix digits").setDesc("Number of digits to show at the end").addText((text) => text.setPlaceholder("4").setValue(String(this.plugin.settings.suffixDigits)).onChange(async (value) => {
      this.plugin.settings.suffixDigits = parseInt(value) || 4;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Mask character").setDesc("Character used for masking").addText((text) => text.setPlaceholder("*").setValue(this.plugin.settings.maskChar).onChange(async (value) => {
      this.plugin.settings.maskChar = value || "*";
      await this.plugin.saveSettings();
    }));
  }
};

/* nosourcemap */