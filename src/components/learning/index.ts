import Callout from './Callout.astro';
import CodeExample from './CodeExample.astro';
import ComplexityTable from './ComplexityTable.astro';
import ConceptCheck from './ConceptCheck.astro';
import DiagramFrame from './DiagramFrame.astro';
import LabCard from './LabCard.astro';

// Available in every lesson without an import. Lesson-specific diagrams and
// hydrated islands (client:*) are still imported in the MDX file.
export const lessonComponents = {
  Callout,
  CodeExample,
  ComplexityTable,
  ConceptCheck,
  DiagramFrame,
  LabCard,
};
