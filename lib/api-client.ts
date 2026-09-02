"use client";

// ── HTTP API Client Wrapper (zetera-fe) ───────────────────
// Unified request handler with JWT injection, error normalization & JSON serialization.

export const TOKEN_KEY = "zetera_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number = 500, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add Content-Type: application/json if sending a JSON body
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let json: any = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      json = await res.json();
    }

    if (!res.ok) {
      let errorMsg =
        json?.message ||
        json?.error ||
        `Permintaan gagal dengan status ${res.status}`;
      if (Array.isArray(json?.errors) && json.errors.length > 0) {
        errorMsg += `: ${json.errors.join(", ")}`;
      }
      throw new ApiError(errorMsg, res.status, json);
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || "Gagal menghubungi server API",
      0,
      err
    );
  }
}

// ── Generic HTTP Methods ─────────────────────────────────
export const http = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { method: "GET", ...options });
  },

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  },

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { method: "DELETE", ...options });
  },

  upload<T>(path: string, formData: FormData, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: formData,
      ...options,
    });
  },
};

// ── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "ADMIN" | "USER";
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  namaLengkap: string;
  nim: string;
  programStudi: string;
  fakultas: string;
  universitas: string;
  kota: string;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalTemplateSection {
  id: string;
  templateId: string;
  order: number;
  title: string;
  isOptional?: boolean;
  guidanceText?: string | null;
  latexSnippet?: string | null;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  sourceFaculty?: string | null;
  code?: string;
  university?: string;
  description?: string;
  isDefault?: boolean;
  ownerId?: string | null;
  documentClass?: string;
  preambleLatex?: string;
  latexBody?: string;
  margins?: { top: string; bottom: string; left: string; right: string };
  sections?: ProposalTemplateSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchProject {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  field?: string | null;
  nama?: string | null;
  logoUrl?: string | null;
  prodi?: string | null;
  kelas?: string | null;
  approachType?: "QUANTITATIVE" | "QUALITATIVE" | "MIXED" | string | null;
  approachConfig?: any | null;
  commonNarrative?: any | null;
  customOutline?: any | null;
  citationStyle?: string | null;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  _count?: {
    journals: number;
    frameworkNodes?: number;
    frameworkEdges?: number;
  };
}

export type NodeType = "VARIABLE" | "CONCEPT" | "METHOD" | "THEORY" | "GAP" | "PROBLEM";
export type NodeEvidenceStatus = "UNSUPPORTED" | "SUPPORTED" | "CONTRADICTORY" | "NEEDS_REVIEW";
export type JournalStatus = "CANDIDATE" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
export type JournalSourceType = "PDF" | "DOI" | "URL" | "MANUAL";
export type EvidenceType = "SUPPORTS" | "CONTRADICTS" | "MENTIONS";
export type ExtractionMethod = "MINERU_PIPELINE" | "MINERU_VLM" | "GROBID" | "PDFPARSE" | "OCR" | "MANUAL";
export type ExtractionStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export interface FrameworkNode {
  id: string;
  projectId: string;
  label: string;
  type: NodeType;
  description?: string | null;
  status: NodeEvidenceStatus;
  positionX: number;
  positionY: number;
  methodCoverage?: string | null;
  createdAt: string;
  updatedAt: string;
  sourceEdges?: FrameworkEdge[];
  targetEdges?: FrameworkEdge[];
  nodeMappings?: JournalNodeMapping[];
}

export interface FrameworkEdge {
  id: string;
  projectId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipLabel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalNodeMapping {
  id: string;
  journalId: string;
  nodeId: string;
  evidenceType: EvidenceType;
  quote?: string | null;
  sourcePage: number;
  sourceDoi?: string | null;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  node?: FrameworkNode;
}

export type JournalTier = "PRIMARY" | "SUPPORTING" | "EXCLUDED";

export interface Journal {
  id: string;
  projectId: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  publication?: string | null;
  doi?: string | null;
  url?: string | null;
  abstract?: string | null;
  fullText?: string | null;
  keyFindings?: string | null;
  relevanceScore?: number;
  tier?: JournalTier;
  verifiedAt?: string | null;
  pdfStoragePath?: string | null;
  status: JournalStatus;
  sourceType: JournalSourceType;
  fileKey?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
  rawExtraction?: any;
  extractionMethod?: ExtractionMethod;
  extractionStatus?: ExtractionStatus;
  extractionError?: string | null;
  createdAt: string;
  updatedAt: string;
  nodeMappings?: JournalNodeMapping[];
}

export interface ProjectFrameworkResponse {
  project: ResearchProject;
  nodes: FrameworkNode[];
  edges: FrameworkEdge[];
}

export interface AiRelationRecommendation {
  recommendedRelation: string;
  badge: string;
  explanation: string;
  hypothesis: string;
  methodSuggestion?: string;
}

export interface DoiMetadataResult {
  doi: string;
  title: string;
  authors: string;
  year: number | null;
  publication: string;
  abstract: string;
  url: string;
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export type OutlineItemStatus = "EMPTY" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_MORE";

export interface ResearchTask {
  what: string;
  why: string;
  how: string;
  bulletInstructions?: { step: string; searchQuery?: string }[];
  searchQueries: string[];
  targetEvidence: number;
  evidenceType: string[];
}

export interface OutlineEvidence {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  addedAt: string;
  sourceType: "MANUAL" | "OPENALEX" | "SEMANTIC_SCHOLAR" | "AI_SYNTHESIS" | "CROSSREF" | "BUKU" | "LAPORAN_RESMI" | "JURNAL_MANUAL" | "WEBSITE" | "LAINNYA" | string;
  publication?: string;
  venue?: string;
}


export interface ResearchOutlineItem {
  id: string;
  projectId: string;
  itemId: string;
  title: string;
  bab: number;
  depth: number;
  order: number;
  status: OutlineItemStatus;
  researchTask: ResearchTask | null;
  evidence: OutlineEvidence[];
  userNotes: string | null;
  isLocked: boolean;
  dependsOn: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Domain API Module ────────────────────────────────────
export const api = {
  // Auth Module
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      http.post<{ success: boolean; user: User; token: string }>("/api/auth/register", body),

    login: (body: { email: string; password: string }) =>
      http.post<{ success: boolean; user: User; token: string }>("/api/auth/login", body),

    me: () => http.get<{ success: boolean; user: User }>("/api/auth/me"),
  },

  // User Profile (Onboarding)
  profile: {
    get: () => http.get<{ success: boolean; data: UserProfile | null }>("/api/profile"),
    upsert: (body: {
      namaLengkap: string;
      nim: string;
      programStudi: string;
      fakultas: string;
      universitas: string;
      kota: string;
      logoUrl?: string | null;
    }) => http.post<{ success: boolean; data: UserProfile }>("/api/profile", body),
    checkOnboarding: () => http.get<{ success: boolean; isComplete: boolean; profile?: UserProfile }>("/api/profile/onboarding"),
  },

  // Proposal Templates Library
  templates: {
    list: () => http.get<{ success: boolean; data: ProposalTemplate[] }>("/api/templates"),
    get: (templateId: string) => http.get<{ success: boolean; data: ProposalTemplate }>(`/api/templates/${templateId}`),
    clone: (templateId: string, name?: string) =>
      http.post<{ success: boolean; data: ProposalTemplate }>(`/api/templates/${templateId}/clone`, { name }),
    update: (templateId: string, body: { name?: string; sections?: { order?: number; title: string; isOptional?: boolean; guidanceText?: string | null }[] }) =>
      http.patch<{ success: boolean; data: ProposalTemplate }>(`/api/templates/${templateId}`, body),
    delete: (templateId: string) => http.delete<{ success: boolean; message: string }>(`/api/templates/${templateId}`),
    seed: () => http.post<{ success: boolean; seeded: boolean; message: string }>("/api/templates/seed"),
  },

  // Research Projects CRUD & Proposal Workflow
  projects: {
    list: () => http.get<{ success: boolean; data: ResearchProject[] }>("/api/projects"),
    get: (id: string) => http.get<{ success: boolean; data: ResearchProject }>(`/api/projects/${id}`),
    create: (body: Partial<ResearchProject>) =>
      http.post<{ success: boolean; data: ResearchProject }>("/api/projects", body),
    update: (id: string, body: Partial<ResearchProject>) =>
      http.patch<{ success: boolean; data: ResearchProject }>(`/api/projects/${id}`, body),
    delete: (id: string) => http.delete<{ success: boolean; message: string }>(`/api/projects/${id}`),
    brainstormTopics: (body: { minat: string; kataKunci?: string; constraints?: string; field?: string }) =>
      http.post<{ success: boolean; data: any[] }>("/api/projects/brainstorm-topics", body),
    recommendOutline: (body: { title: string; field?: string; approachType?: string; approachConfig?: any }) =>
      http.post<{ success: boolean; data: any }>("/api/projects/recommend-outline", body),
    syncProposalToFramework: (projectId: string, proposalText?: string) =>
      http.post<{ success: boolean; data: any }>(`/api/projects/${projectId}/sync-framework`, { proposalText }),

    // Custom BAB / Daftar Isi
    customOutline: {
      get: (projectId: string) =>
        http.get<{ success: boolean; data: { projectId: string; title: string; customOutline: any } }>(`/api/projects/${projectId}/custom-outline`),
      save: (projectId: string, customOutline: any) =>
        http.put<{ success: boolean; data: any; message: string }>(`/api/projects/${projectId}/custom-outline`, { customOutline }),
      suggest: (projectId: string, body: { babNumber: number; currentOutline?: any }) =>
        http.post<{ success: boolean; data: { itemId: string; title: string; description?: string }[] }>(`/api/projects/${projectId}/custom-outline/ai-suggest`, body),
    },

    // Outline / Research Blueprint
    outline: {
      generate: (projectId: string) =>
        http.post<{ success: boolean; data: { itemsCreated: number; items: ResearchOutlineItem[] } }>(`/api/projects/${projectId}/outline/generate`, {}),
      generateItem: (projectId: string, itemId: string) =>
        http.post<{ success: boolean; data: ResearchOutlineItem }>(`/api/projects/${projectId}/outline/${itemId}/generate`, {}),
      get: (projectId: string) =>
        http.get<{ success: boolean; data: { project: Partial<ResearchProject>; items: ResearchOutlineItem[] } }>(`/api/projects/${projectId}/outline`),
      updateItem: (projectId: string, itemId: string, body: { status?: OutlineItemStatus; userNotes?: string }) =>
        http.patch<{ success: boolean; data: ResearchOutlineItem }>(`/api/projects/${projectId}/outline/${itemId}`, body),
      addEvidence: (projectId: string, itemId: string, evidence: Partial<OutlineEvidence>) =>
        http.post<{ success: boolean; data: { item: ResearchOutlineItem; evidenceAdded: OutlineEvidence } }>(`/api/projects/${projectId}/outline/${itemId}/evidence`, evidence),
      removeEvidence: (projectId: string, itemId: string, evidenceId: string) =>
        http.delete<{ success: boolean; data: ResearchOutlineItem }>(`/api/projects/${projectId}/outline/${itemId}/evidence/${evidenceId}`),
      getPoolJournals: (projectId: string, itemId: string) =>
        http.get<{ success: boolean; data: (Journal & { isAttached: boolean })[] }>(`/api/projects/${projectId}/outline/${itemId}/pool-journals`),
      search: (projectId: string, query: string, limit?: number) => {
        const qs = new URLSearchParams({ query, ...(limit ? { limit: String(limit) } : {}) });
        return http.get<{ success: boolean; data: Partial<OutlineEvidence>[] }>(`/api/projects/${projectId}/outline/search?${qs}`);
      },
    },
  },

  // Research Framework (React Flow Node Canvas)
  framework: {
    get: (projectId: string) =>
      http.get<{ success: boolean; data: ProjectFrameworkResponse }>(`/api/projects/${projectId}/framework`),

    createNode: (projectId: string, body: { label: string; type?: NodeType; description?: string; positionX?: number; positionY?: number }) =>
      http.post<{ success: boolean; data: FrameworkNode }>(`/api/projects/${projectId}/framework/nodes`, body),

    updateNode: (projectId: string, nodeId: string, body: Partial<{ label: string; type: NodeType; description: string; status: NodeEvidenceStatus; positionX: number; positionY: number }>) =>
      http.patch<{ success: boolean; data: FrameworkNode }>(`/api/projects/${projectId}/framework/nodes/${nodeId}`, body),

    deleteNode: (projectId: string, nodeId: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/projects/${projectId}/framework/nodes/${nodeId}`),

    createEdge: (projectId: string, body: { sourceNodeId: string; targetNodeId: string; relationshipLabel?: string }) =>
      http.post<{ success: boolean; data: FrameworkEdge }>(`/api/projects/${projectId}/framework/edges`, body),

    deleteEdge: (projectId: string, edgeId: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/projects/${projectId}/framework/edges/${edgeId}`),

    syncPositions: (projectId: string, nodes: { id: string; positionX: number; positionY: number }[]) =>
      http.put<{ success: boolean; message: string }>(`/api/projects/${projectId}/framework/sync-positions`, { nodes }),

    recommendRelation: (projectId: string, body: { sourceNodeId: string; targetNodeId: string; sourceLabel?: string; sourceType?: string; targetLabel?: string; targetType?: string }) =>
      http.post<{ success: boolean; source: string; data: AiRelationRecommendation }>(`/api/projects/${projectId}/framework/ai-recommend-relation`, body),

    generateFromJournals: (projectId: string, body?: { journalId?: string; mode?: "SYNTHESIS" | "SINGLE_JOURNAL" }) =>
      http.post<{
        success: boolean;
        data: {
          success: boolean;
          mode: "SYNTHESIS" | "SINGLE_JOURNAL";
          summary: string;
          totalNodes: number;
          totalEdges: number;
          nodes: FrameworkNode[];
          edges: FrameworkEdge[];
        };
      }>(`/api/projects/${projectId}/framework/generate-from-journals`, body || {}),

    generateDraft: (projectId: string) =>
      http.post<{
        success: boolean;
        data: {
          judul: string;
          bab1LatarBelakang: {
            judulBagian: string;
            paragraf: string[];
          };
          bab2KerangkaPemikiran: {
            judulBagian: string;
            paragraf: string[];
          };
          bab3HipotesisMetode: {
            judulBagian: string;
            hipotesis: string[];
            justifikasiMetode: string;
          };
          daftarPustakaRujukan: string[];
        };
      }>(`/api/projects/${projectId}/framework/generate-draft`),
  },

  // Journals Module (Fase 2: Library & Reader)
  journals: {
    list: (projectId: string, params?: { query?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.query) queryParams.set("query", params.query);
      if (params?.status && params.status !== "ALL") queryParams.set("status", params.status);
      const qs = queryParams.toString();
      return http.get<{ success: boolean; data: Journal[] }>(`/api/projects/${projectId}/journals${qs ? `?${qs}` : ""}`);
    },

    get: (projectId: string, journalId: string) =>
      http.get<{ success: boolean; data: Journal }>(`/api/projects/${projectId}/journals/${journalId}`),

    create: (projectId: string, body: Partial<Journal>) =>
      http.post<{ success: boolean; data: Journal }>(`/api/projects/${projectId}/journals`, body),

    update: (projectId: string, journalId: string, body: Partial<Journal>) =>
      http.patch<{ success: boolean; data: Journal }>(`/api/projects/${projectId}/journals/${journalId}`, body),

    delete: (projectId: string, journalId: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/projects/${projectId}/journals/${journalId}`),

    purgeRejected: (projectId: string) =>
      http.delete<{ success: boolean; deletedCount: number; message: string }>(`/api/projects/${projectId}/journals/purge-rejected`),

    uploadPdf: (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return http.upload<{ success: boolean; data: Journal }>(`/api/projects/${projectId}/journals/upload`, formData);
    },

    extractPdf: (projectId: string, journalId: string) =>
      http.post<{ success: boolean; message: string; data: Journal }>(`/api/projects/${projectId}/journals/${journalId}/extract`),

    screenJournal: (projectId: string, journalId: string) =>
      http.post<{ success: boolean; message: string; data: Journal }>(`/api/projects/${projectId}/journals/${journalId}/screen`),

    lookupDoi: (projectId: string, doi: string) =>
      http.post<{ success: boolean; data: DoiMetadataResult }>(`/api/projects/${projectId}/journals/doi-lookup`, { doi }),

    updateTier: (projectId: string, journalId: string, tier: JournalTier) =>
      http.patch<{ success: boolean; data: Journal; message: string }>(`/api/projects/${projectId}/journals/${journalId}/tier`, { tier }),

    verifyDoi: (projectId: string, journalId: string) =>
      http.post<{ success: boolean; data: Journal; message: string }>(`/api/projects/${projectId}/journals/${journalId}/verify-doi`, {}),

    mapEvidence: (projectId: string, journalId: string, body: { nodeId: string; evidenceType?: EvidenceType; quote?: string; pageNumber: number }) =>
      http.post<{ success: boolean; data: JournalNodeMapping }>(`/api/projects/${projectId}/journals/${journalId}/evidence`, body),

    removeEvidence: (projectId: string, journalId: string, mappingId: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/projects/${projectId}/journals/${journalId}/evidence/${mappingId}`),

    aiCrosscheck: (projectId: string, journalId: string) =>
      http.post<{
        success: boolean;
        aiAnalysis: {
          topicFit?: string;
          relevanceScore?: number;
          recommendationReason?: string;
          executiveSummary: string;
          methodology: string;
          sampleSize: string;
          keyEmpiricalFindings: string;
          matchedEvidence: { nodeId: string; evidenceType: EvidenceType; quote: string; confidence: number }[];
        };
        journal: Journal;
        newMappings: JournalNodeMapping[];
      }>(`/api/projects/${projectId}/journals/${journalId}/analyze`),
  },

  // AI Screening & Auto-Populate Framework (Fase 3 & 4)
  screening: {
    evaluateBatch: (projectId: string) =>
      http.post<{
        success: boolean;
        data: {
          projectId: string;
          totalScreened: number;
          results: {
            journalId: string;
            title: string;
            authors?: string;
            year?: number;
            relevanceScore: number;
            recommendation: JournalStatus;
            reasoning: string;
            keyTheme: string;
          }[];
        };
      }>(`/api/projects/${projectId}/screening/evaluate-batch`),

    autoPopulateFramework: (projectId: string, journalIds?: string[]) =>
      http.post<{
        success: boolean;
        data: {
          success: boolean;
          message: string;
          totalNodesCreated: number;
          totalEdgesCreated: number;
        };
      }>(`/api/projects/${projectId}/screening/auto-populate-framework`, { journalIds }),
  },

  // Proposal Writing & Document Synthesis Module
  proposal: {
    get: (projectId: string) =>
      http.get<{
        success: boolean;
        data: {
          project: ResearchProject;
          profile: UserProfile;
          literatureMatrix: any[];
          savedDraft?: any;
          outlineItems?: ResearchOutlineItem[];
        };
      }>(`/api/projects/${projectId}/proposal`),

    save: (projectId: string, data: any) =>
      http.post<{ success: boolean; message: string; data: any }>(`/api/projects/${projectId}/proposal/save`, data),

    generate: (projectId: string, body?: any) =>
      http.post<{ success: boolean; data: any }>(`/api/projects/${projectId}/proposal/generate`, body || {}),

    chat: (projectId: string, body: { sectionId?: string; command: string; currentContent?: string; conversationHistory?: any[] }) =>
      http.post<{
        success: boolean;
        sectionId?: string;
        revisedContent: string;
        explanation: string;
        usedCitations?: string[];
      }>(`/api/projects/${projectId}/proposal/chat`, body),

    exportDocx: (projectId: string) => `/api/projects/${projectId}/proposal/export-docx`,
    exportLatex: (projectId: string, template?: string) =>
      `/api/projects/${projectId}/proposal/export-latex?template=${template || "TELKOM_FIF"}`,
  },

  // Project Memory
  memory: {
    get: (projectId: string) =>
      http.get<{ success: boolean; data: any }>(`/api/projects/${projectId}/memory`),
    updateToc: (projectId: string, tocItems: any[]) =>
      http.put<{ success: boolean; data: any }>(`/api/projects/${projectId}/memory/toc`, { tocItems }),
  },

  // File & Image Uploads
  upload: {

    image: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return http.upload<{ success: boolean; data: UploadResult }>("/api/upload/image", formData);
    },
    file: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return http.upload<{ success: boolean; data: UploadResult }>("/api/upload/file", formData);
    },
  },

  // Admin APIs
  admin: {
    // Executive Dashboard & Telemetry
    getStats: () =>
      http.get<{
        success: boolean;
        data: {
          totalUsers: number;
          totalProjects: number;
          totalJournals: number;
          totalNodes: number;
          billing: {
            id: number;
            globalMultiplier: number;
            baseRateUsdIdr: number;
            inflationBuffer: number;
            referenceCreditIdr: number;
            minCreditFloor: number;
            effectiveRateUsdIdr: number;
            totalRevenueIdr: number;
            totalRevenueUsd: number;
            aiExpenseIdr: number;
            aiExpenseUsd: number;
            netProfitUsd: number;
            totalTokensUsed: number;
            totalPaidCalls: number;
            totalFreeCalls: number;
            remainingBudgetUsd: number;
            totalBudgetCapUsd: number;
            remainingPercent: number;
          };
          modelUsageDistribution: {
            modelId: string;
            label: string;
            modelName: string;
            isFreeTier: boolean;
            count: number;
            totalTokens: number;
            costUsd: number;
          }[];
          userTiers: { tier: string; count: number }[];
          recentLogs: {
            id: string;
            timestamp: string;
            userEmail: string;
            userName: string;
            featureLabel: string;
            modelName: string;
            inputTokens: number;
            outputTokens: number;
            costUsd: number;
            chargeUser: number;
            creditsCharged: number;
            profitUsd: number;
            isFreeTier: boolean;
            responseTimeMs: number;
          }[];
          serverTime: string;
        };
      }>("/api/admin/stats"),

    // Master Exchange Settings
    getBillingConfig: () =>
      http.get<{
        success: boolean;
        data: {
          id: number;
          globalMultiplier: number;
          baseRateUsdIdr: number;
          inflationBuffer: number;
          referenceCreditIdr: number;
          minCreditFloor: number;
          effectiveRateUsdIdr: number;
        };
      }>("/api/admin/billing-config"),

    updateBillingConfig: (data: {
      globalMultiplier?: number;
      baseRateUsdIdr?: number;
      inflationBuffer?: number;
      referenceCreditIdr?: number;
      minCreditFloor?: number;
    }) =>
      http.patch<{
        success: boolean;
        message: string;
        data: any;
      }>("/api/admin/billing-config", data),

    // AI Models
    getAiModels: () =>
      http.get<{
        success: boolean;
        data: {
          id: string;
          routerLabel: string;
          baseUrl: string;
          modelName: string;
          apiKeyMasked: string;
          modelKind: "LLM" | "EXTRACTION" | "EMBEDDING";
          pricingUnit: "TOKEN" | "DOCUMENT";
          priceInputPer1M: number;
          priceOutputPer1M: number;
          pricePerDocument: number;
          maxBudgetUsd: number;
          rpmLimit: number;
          avgTokensPerUse: number;
          isActive: boolean;
          isFreeTier: boolean;
          lastSyncedBalance?: number | null;
          lastSyncedAt?: string | null;
          createdAt: string;
        }[];
      }>("/api/admin/ai-models"),

    createAiModel: (data: any) =>
      http.post<{ success: boolean; message: string; data: any }>("/api/admin/ai-models", data),

    updateAiModel: (id: string, data: any) =>
      http.patch<{ success: boolean; message: string; data: any }>(`/api/admin/ai-models/${id}`, data),

    deleteAiModel: (id: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/admin/ai-models/${id}`),

    syncAiModelBalance: (id: string) =>
      http.post<{ success: boolean; message: string; data: any }>(`/api/admin/ai-models/${id}/sync-balance`, {}),

    testAiModel: (id: string) =>
      http.post<{ success: boolean; message: string; response?: string }>(`/api/admin/ai-models/${id}/test`, {}),

    // Feature Routings Matrix
    getFeatureRoutings: () =>
      http.get<{
        success: boolean;
        data: {
          id: string;
          code: string;
          label: string;
          description?: string;
          baseCreditCost: number;
          isActive: boolean;
          routing?: {
            id: string;
            primaryModelId: string;
            fallbackModelId?: string | null;
            primaryModel: any;
            fallbackModel?: any;
          };
        }[];
      }>("/api/admin/feature-routings"),

    updateFeatureRouting: (featureId: string, data: {
      primaryModelId?: string;
      fallbackModelId?: string | null;
      baseCreditCost?: number;
      isActive?: boolean;
    }) =>
      http.patch<{ success: boolean; message: string; data: any }>(`/api/admin/feature-routings/${featureId}`, data),

    // Credit Packages
    getCreditPackages: () =>
      http.get<{
        success: boolean;
        data: {
          id: string;
          name: string;
          type: "ONE_TIME" | "SUBSCRIPTION";
          creditsGranted: number;
          durationDays?: number | null;
          priceNormal: number;
          priceDiscount?: number | null;
          badgeLabel?: string | null;
          isActive: boolean;
          createdAt: string;
        }[];
      }>("/api/admin/credit-packages"),

    createCreditPackage: (data: any) =>
      http.post<{ success: boolean; message: string; data: any }>("/api/admin/credit-packages", data),

    updateCreditPackage: (id: string, data: any) =>
      http.patch<{ success: boolean; message: string; data: any }>(`/api/admin/credit-packages/${id}`, data),

    deleteCreditPackage: (id: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/admin/credit-packages/${id}`),

    simulatePackage: (data: {
      modelId?: string;
      selectedFeatureCodes?: string[];
      targetMargin?: number;
      expectedGenerationsPerMonth?: number;
    }) =>
      http.post<{
        success: boolean;
        data: {
          modelUsed: string;
          estimatedCostPerCallUsd: number;
          totalHppIdr: number;
          suggestedPriceIdr: number;
          recommendedCredits: number;
          pricePerCredit: number;
          effectiveMarginPercent: number;
          featuresIncluded: string[];
        };
      }>("/api/admin/credit-packages/simulate", data),

    // Live AI Usage Logs
    getUsageLogs: (params?: { page?: number; limit?: number; isFreeTier?: string; modelId?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append("page", String(params.page));
      if (params?.limit) q.append("limit", String(params.limit));
      if (params?.isFreeTier !== undefined) q.append("isFreeTier", params.isFreeTier);
      if (params?.modelId) q.append("modelId", params.modelId);
      if (params?.search) q.append("search", params.search);
      return http.get<{
        success: boolean;
        data: any[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/admin/usage-logs?${q.toString()}`);
    },

    // User Management
    getUsers: () =>
      http.get<{
        success: boolean;
        data: {
          id: string;
          name: string;
          email: string;
          role: "ADMIN" | "USER";
          totalCredits?: number;
          totalGenerates?: number;
          projectCount: number;
          createdAt: string;
        }[];
      }>("/api/admin/users"),

    updateUserRole: (userId: string, role: "ADMIN" | "USER") =>
      http.patch<{
        success: boolean;
        message: string;
        data: { id: string; name: string; email: string; role: "ADMIN" | "USER" };
      }>(`/api/admin/users/${userId}/role`, { role }),

    // Database Secrets
    getConfigs: () =>
      http.get<{
        success: boolean;
        data: {
          id: string;
          key: string;
          description: string;
          maskedValue: string;
          isEncrypted: boolean;
          updatedAt: string;
        }[];
      }>("/api/admin/configs"),

    getPresets: () =>
      http.get<{
        success: boolean;
        data: {
          key: string;
          label: string;
          desc: string;
          defaultValue?: string;
          isSecret: boolean;
          options?: string[];
        }[];
      }>("/api/admin/presets"),

    updateConfig: (data: { key: string; value: string; description?: string }) =>
      http.post<{ success: boolean; message: string }>("/api/admin/configs", data),

    deleteConfig: (key: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/admin/configs/${encodeURIComponent(key)}`),

    importCurl: (curlText: string) =>
      http.post<{ success: boolean; message: string; data?: any }>("/api/admin/import-curl", { curlText }),

    testGroq: (keyName?: string) =>
      http.post<{ success: boolean; message: string; response?: string }>("/api/admin/configs/test-groq", { keyName }),
  },

  // ── AI Prompt & Skill Library ────────────────────────
  prompts: {
    list: (params?: { category?: string; tag?: string; search?: string; activeOnly?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.tag) q.set("tag", params.tag);
      if (params?.search) q.set("search", params.search);
      if (params?.activeOnly) q.set("activeOnly", "true");
      return http.get<{ success: boolean; data: AiSkillPrompt[] }>(`/api/prompts?${q.toString()}`);
    },

    get: (code: string) =>
      http.get<{ success: boolean; data: AiSkillPrompt }>(`/api/prompts/${encodeURIComponent(code)}`),

    create: (data: Partial<AiSkillPrompt>) =>
      http.post<{ success: boolean; data: AiSkillPrompt }>("/api/prompts", data),

    update: (idOrCode: string, data: Partial<AiSkillPrompt>) =>
      http.put<{ success: boolean; data: AiSkillPrompt }>(`/api/prompts/${encodeURIComponent(idOrCode)}`, data),

    delete: (idOrCode: string) =>
      http.delete<{ success: boolean; message: string }>(`/api/prompts/${encodeURIComponent(idOrCode)}`),
  },
};

export interface AiSkillPrompt {
  id: string;
  code: string;
  title: string;
  category: "SUBCHAPTER" | "OUTLINE" | "PROPOSAL" | "SCREENING" | "FRAMEWORK" | "LITERATURE" | string;
  tags?: string[] | null;
  description?: string | null;
  systemPrompt: string;
  userPromptTemplate?: string | null;
  recipeSteps?: string[] | null;
  version: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}


