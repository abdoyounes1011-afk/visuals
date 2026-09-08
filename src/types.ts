export interface NoteSection {
  numberBadge?: number; // 1, 2, 3, 4 with colored circle badge
  heading: string;
  type?: "concept" | "flowchart" | "management" | "warning" | "anatomy" | "comparison";
  highlightColor?: "yellow" | "orange" | "peach" | "blue" | "cyan" | "pink" | "red" | "green";
  icon?: string;
  lines: string[];
  diagramType?:
    | "eye_burn"
    | "eye_anatomy"
    | "wipe_particles"
    | "flowchart_chain"
    | "heart_cardiac"
    | "lungs_resp"
    | "brain_neuro"
    | "kidney_renal"
    | "molecules_chem"
    | "generic";
  diagramLabels?: string[];
  render3dUrl?: string;
  render3dPrompt?: string;
  subNote?: string;
  calloutBox?: {
    text: string;
    type?: "alert" | "pill" | "note";
  };
}

export interface HandwrittenNoteData {
  title: string;
  titleLines?: string[];
  subtitle?: string;
  date?: string;
  sections: NoteSection[];
  cover3dRenderUrl?: string;
  marginNote?: string;
  recommendedDoodles?: string[];
  bottomAlertBox?: {
    mainRule: string;
    subLabel?: string;
  };
}

export interface ExamTrapItem {
  trapName: string;
  whyExaminersTestIt: string;
  theMistake: string;
  theGoldenRule: string;
  lookAlikes?: string;
}

export interface ExamTrapsData {
  topic: string;
  traps: ExamTrapItem[];
  redFlags: string[];
  dontDoList: string[];
}

export type ActiveTool = "home" | "handwritten" | "zatona" | "traps" | "privacy" | "terms" | "disclaimer";
