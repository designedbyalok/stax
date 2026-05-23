export type SourcePlatform =
  | "LINKEDIN"
  | "GREENHOUSE"
  | "LEVER"
  | "WORKDAY"
  | "INDEED"
  | "OTHER";

export type ParseFields = {
  roleTitle?: string;
  companyName?: string;
  location?: string;
  salaryRange?: string;
  jobDescription?: string;
  companyLogoUrl?: string;
};

export type ParseResult = {
  success: boolean;
  partial: boolean;
  source: SourcePlatform;
  fields: ParseFields;
  // Fields the parser populated but isn't confident about — drives "uncertain"
  // UI indicators in the preview.
  uncertainFields: (keyof ParseFields)[];
  originalUrl: string;
  error?: string;
};

export type Parser = (url: string, html: string) => ParseResult | Promise<ParseResult>;
