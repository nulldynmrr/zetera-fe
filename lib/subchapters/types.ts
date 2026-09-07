/**
 * Tipe Data Spesifikasi Sub-bab & Bagian Dokumen (Semantic-Based, Non-Numeric)
 */

export type SubchapterCluster = "BAB_1" | "BAB_2" | "BAB_3" | "DOCS" | "CUSTOM";

export type CitationRule = "NONE" | "REQUIRED" | "OPTIONAL";
export type FormatStyle = "PARAGRAPH" | "NUMBERED_LIST" | "TABLE" | "ROADMAP";

export interface SubchapterPaperRules {
  citationMode: CitationRule;
  introSentenceRequired: boolean;
  alignmentRule: string;
  formatStyle: FormatStyle;
  badgeText: string;
  badgeColor: string;
}

export interface SubchapterPaperPreview {
  introSentence?: string;
  points: string[];
  renderedDraft: string;
  formatNote?: string; // Keterangan format tampilan (opsional, untuk info Admin)
}

export interface SubchapterSpec {
  slug: string;
  code: string;
  defaultTitle: string;
  cluster: SubchapterCluster;
  aliases: string[];
  variables: string[];
  outline: {
    systemPrompt: string;
    recipeSteps: string[];
  };
  paper: {
    rules: SubchapterPaperRules;
    previewExample: SubchapterPaperPreview;
  };
}
