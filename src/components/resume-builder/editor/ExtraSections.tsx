"use client";

import { AwardsSection } from "./AwardsSection";
import { CertificationsSection } from "./CertificationsSection";
import { CustomSectionsSection } from "./CustomSectionsSection";
import { InterestsSection } from "./InterestsSection";
import { LanguagesSection } from "./LanguagesSection";
import { PublicationsSection } from "./PublicationsSection";
import { ReferencesSection } from "./ReferencesSection";
import { SectionEditorProps } from "./section-types";
import { VolunteeringSection } from "./VolunteeringSection";

export function ExtraSections({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  const props = { activeResume, handleUpdateContent };

  return (
    <>
      <CertificationsSection {...props} />
      <AwardsSection {...props} />
      <LanguagesSection {...props} />
      <PublicationsSection {...props} />
      <VolunteeringSection {...props} />
      <InterestsSection {...props} />
      <ReferencesSection {...props} />
      <CustomSectionsSection {...props} />
    </>
  );
}
