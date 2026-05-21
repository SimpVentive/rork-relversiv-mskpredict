'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

// ===== TYPE DECLARATIONS =====

type PubTab = 'generate' | 'drafts' | 'submitted';
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type StudyType = 'cross-sectional' | 'cohort' | 'case-control' | 'rct';
type AnalysisOption = 'simple-comparison' | 'dose-response' | 'longitudinal';
type DraftStatus = 'draft' | 'submitted' | 'accepted' | 'rejected';
type ReferenceFormat = 'APA' | 'Vancouver';

interface ParsedQuestion {
  rawTitle: string;
  independentVar: string;
  dependentVar: string;
  population: string;
  studyType: StudyType;
  topicKey: string;
}

interface AnalysisCard {
  id: AnalysisOption;
  title: string;
  description: string;
  statsMethod: string;
  recommendedFor: string;
}

interface DataVariable {
  name: string;
  available: boolean;
  simulatable: boolean;
}

interface Journal {
  id: string;
  name: string;
  category: 'international' | 'indian' | 'conference' | 'internal';
  impactFactor?: string;
  wordLimit: number;
  abstractWords: number;
  referenceFormat: ReferenceFormat;
  guidelines: string;
}

interface MockPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  topicKeys: string[];
  abstract: string;
}

interface PaperSections {
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string;
}

interface Draft {
  id: string;
  title: string;
  status: DraftStatus;
  content: PaperSections;
  createdAt: string;
  lastEditedAt: string;
  target: string;
  wordCount: number;
}

// ===== MOCK DATA =====

const MOCK_PAPERS: MockPaper[] = [
  {
    id: 'p1',
    title: 'Smoking and its Impact on Lumbar Spine Range of Motion: A Cross-Sectional Analysis of 142 Patients',
    authors: 'Sharma RK, Verma A, Nair S',
    year: 2023,
    journal: 'Indian Journal of Physical Medicine & Rehabilitation',
    doi: '10.4103/ijpmr.ijpmr_145_23',
    topicKeys: ['smoking+ROM', 'smoking+back'],
    abstract: 'Smoking was significantly associated with reduced lumbar flexion ROM (p<0.01) in chronic back pain patients.'
  },
  {
    id: 'p2',
    title: 'Hypertension Status and Physical Therapy Outcomes in Acute Low Back Pain',
    authors: 'Kumar S, Prasad N, Singh G',
    year: 2022,
    journal: 'Spine Journal',
    doi: '10.1016/j.spinee.2022.03.001',
    topicKeys: ['HTN+physio', 'HTN+back'],
    abstract: 'HTN was independently associated with delayed functional recovery in physical therapy intervention trials.'
  },
  {
    id: 'p3',
    title: 'Body Mass Index as a Predictor of RPI Score in Musculoskeletal Disorders',
    authors: 'Gupta R, Mishra M, Rao A',
    year: 2023,
    journal: 'Journal of Orthopaedic Research',
    doi: '10.1002/jor.25432',
    topicKeys: ['BMI+RPI', 'BMI+shoulder'],
    abstract: 'Higher BMI was independently associated with elevated RPI scores (r=0.64, p<0.001).'
  },
  {
    id: 'p4',
    title: 'Smoking Cessation and Shoulder Rotator Cuff Recovery: A 6-Month Longitudinal Study',
    authors: 'Chen L, Wang H, Liu J',
    year: 2023,
    journal: 'Shoulder & Elbow',
    doi: '10.1177/1758573223451234',
    topicKeys: ['smoking+shoulder', 'smoking+ROM'],
    abstract: 'Smoking cessation led to significantly improved rotator cuff strength at 6-month follow-up (p<0.05).'
  },
  {
    id: 'p5',
    title: 'Physiotherapy Outcomes and ROM in Shoulder Impingement: A Meta-Analysis',
    authors: 'Thompson K, Brown J, Lee S',
    year: 2022,
    journal: 'Manual Therapy',
    doi: '10.1016/j.math.2022.06.007',
    topicKeys: ['ROM+physio', 'physio+recovery'],
    abstract: 'Combined manual therapy and exercise yielded superior ROM outcomes versus exercise alone.'
  },
  {
    id: 'p6',
    title: 'Age-Related Differences in Knee ROM Recovery Following Injury',
    authors: 'Anderson P, Davis M, White C',
    year: 2023,
    journal: 'Journal of Aging and Physical Activity',
    doi: '10.1123/japa.2022-0321',
    topicKeys: ['age+knee', 'age+ROM'],
    abstract: 'Older adults demonstrated slower knee ROM recovery compared to younger cohorts (p<0.01).'
  },
  {
    id: 'p7',
    title: 'Comorbidity Burden and Back Pain Severity: A Cross-Sectional Study of 500 Patients',
    authors: 'Patel S, Kapoor N, Singh R',
    year: 2023,
    journal: 'Indian Journal of Orthopaedics',
    doi: '10.1007/s43465-023-00891-6',
    topicKeys: ['comorbidity+back', 'HTN+back'],
    abstract: 'Each additional comorbidity was associated with 0.8-point increase in pain severity (p<0.01).'
  },
  {
    id: 'p8',
    title: 'Gender Differences in Range of Motion Recovery Post-Injury',
    authors: 'Martinez E, Lopez F, Garcia M',
    year: 2022,
    journal: 'Physical Therapy Reviews',
    doi: '10.1080/10833196.2022.2045678',
    topicKeys: ['gender+ROM', 'ROM+physio'],
    abstract: 'No significant gender differences were found in ROM recovery trajectories in this cohort.'
  },
  {
    id: 'p9',
    title: 'Predictive Validity of RPI Score for Long-Term Musculoskeletal Outcomes',
    authors: 'Johnson W, Smith H, Taylor D',
    year: 2023,
    journal: 'Musculoskeletal Science & Practice',
    doi: '10.1016/j.msksp.2023.102653',
    topicKeys: ['RPI+outcome', 'RPI+back'],
    abstract: 'RPI score at baseline was a significant predictor of 12-month functional outcomes (r=0.71, p<0.001).'
  },
  {
    id: 'p10',
    title: 'Smoking and Shoulder Range of Motion in Overhead Athletes',
    authors: 'Collins P, Roberts V, Adams J',
    year: 2023,
    journal: 'Journal of Athletic Training',
    doi: '10.4085/1062-6050-0471.21',
    topicKeys: ['smoking+shoulder', 'smoking+ROM'],
    abstract: 'Smoking history was negatively associated with shoulder abduction ROM in elite athletes.'
  },
  {
    id: 'p11',
    title: 'Physiotherapy Intensity and Patient Adherence in Low Back Pain',
    authors: 'Wagner N, Peters K, Schmidt B',
    year: 2022,
    journal: 'Physical Medicine and Rehabilitation',
    doi: '10.1097/PHM.0000000000001234',
    topicKeys: ['physio+recovery', 'physio+back'],
    abstract: 'Higher physiotherapy adherence rates correlated with greater functional recovery (r=0.58, p<0.01).'
  },
  {
    id: 'p12',
    title: 'Longitudinal Assessment of ROM in Patients with Chronic Shoulder Pain',
    authors: 'Xu Y, Chen T, Wu M',
    year: 2023,
    journal: 'Journal of Orthopaedic Surgery and Research',
    doi: '10.1186/s13018-023-03865-7',
    topicKeys: ['ROM+physio', 'age+shoulder'],
    abstract: 'ROM improved linearly over 12-week intervention period (effect size d=1.2).'
  },
  {
    id: 'p13',
    title: 'HTN Management and Musculoskeletal Pain: A Systematic Review',
    authors: 'O\'Brien S, Sullivan M, Murphy P',
    year: 2023,
    journal: 'Hypertension Research',
    doi: '10.1038/s41440-023-01234-9',
    topicKeys: ['HTN+physio', 'HTN+back'],
    abstract: 'BP control was associated with reduced musculoskeletal pain perception in 8 of 12 studies.'
  },
  {
    id: 'p14',
    title: 'BMI and Physical Therapy Outcomes in Musculoskeletal Rehabilitation',
    authors: 'Park J, Kim S, Lee K',
    year: 2022,
    journal: 'Obesity Research & Clinical Practice',
    doi: '10.1016/j.orcp.2022.11.004',
    topicKeys: ['BMI+RPI', 'BMI+shoulder', 'BMI+back'],
    abstract: 'Overweight/obese patients required longer intervention duration (p<0.05) but achieved similar ROM outcomes.'
  },
  {
    id: 'p15',
    title: 'Age as a Moderator of Physiotherapy Effectiveness in Knee Pain',
    authors: 'Douglas H, Evans K, Lewis T',
    year: 2023,
    journal: 'Journal of Aging and Health',
    doi: '10.1177/0898264323045678',
    topicKeys: ['age+knee', 'age+ROM', 'physio+recovery'],
    abstract: 'Physiotherapy was equally effective across age groups, though recovery speed varied (p<0.01).'
  },
  {
    id: 'p16',
    title: 'Smoking-Related Impairment in Musculoskeletal Recovery: A Mechanism Review',
    authors: 'Ryan M, Clark P, Stewart L',
    year: 2023,
    journal: 'Nicotine & Tobacco Research',
    doi: '10.1093/ntr/ntad012',
    topicKeys: ['smoking+ROM', 'smoking+back'],
    abstract: 'Smoking impairs collagen synthesis and tissue healing, slowing ROM recovery.'
  },
  {
    id: 'p17',
    title: 'Gender-Specific Outcomes in Rotator Cuff Rehabilitation',
    authors: 'Holmes D, Cooper B, Harris E',
    year: 2022,
    journal: 'American Journal of Physical Medicine & Rehabilitation',
    doi: '10.1097/PHM.0b013e3182471234',
    topicKeys: ['gender+ROM', 'physio+recovery'],
    abstract: 'Female patients showed superior pain reduction; males showed superior strength gains post-surgery.'
  },
  {
    id: 'p18',
    title: 'Comorbidity Count Predicts Recovery Time in Musculoskeletal Injury Rehabilitation',
    authors: 'Nolan G, Foster R, Patterson C',
    year: 2023,
    journal: 'International Journal of Rehabilitation Research',
    doi: '10.1097/MRR.0000000000000456',
    topicKeys: ['comorbidity+back', 'comorbidity+ROM'],
    abstract: '2+ comorbidities added 4.2 weeks (CI: 2.1-6.3) to average recovery time.'
  },
  {
    id: 'p19',
    title: 'RPI Scoring System Validation in Indian Musculoskeletal Population',
    authors: 'Iyer V, Bhat U, Desai M',
    year: 2023,
    journal: 'Indian Spine Journal',
    doi: '10.1177/1947603523451234',
    topicKeys: ['RPI+outcome', 'RPI+back'],
    abstract: 'RPI scores demonstrated excellent internal consistency (α=0.87) and predictive validity.'
  },
  {
    id: 'p20',
    title: 'Cardiovascular Comorbidity Impact on Musculoskeletal Pain Perception',
    authors: 'Zhang L, Wang B, Liu X',
    year: 2022,
    journal: 'Cardiovascular Medicine',
    doi: '10.1186/s12872-022-02451-2',
    topicKeys: ['HTN+physio', 'comorbidity+back'],
    abstract: 'HTN was associated with altered pain perception and slower recovery in MSK cohort.'
  },
  {
    id: 'p21',
    title: 'Longitudinal Smoking Effects on Neck and Shoulder Mobility',
    authors: 'Bell J, Young D, Green A',
    year: 2023,
    journal: 'Occupational Medicine',
    doi: '10.1093/occmed/kqad023',
    topicKeys: ['smoking+shoulder', 'smoking+ROM'],
    abstract: 'Current smokers showed 12% lower shoulder ROM compared to never-smokers (p<0.05).'
  },
  {
    id: 'p22',
    title: 'Age-Adjusted Physical Therapy Dosing for Optimal Outcomes',
    authors: 'Walker P, Turner K, Burton S',
    year: 2023,
    journal: 'Physical Therapy International',
    doi: '10.1002/pri.12345',
    topicKeys: ['age+shoulder', 'age+knee', 'physio+recovery'],
    abstract: 'Older adults benefited from lower-frequency but longer-duration therapy sessions.'
  },
  {
    id: 'p23',
    title: 'BMI-Stratified Analysis of Spinal ROM in Degenerative Disc Disease',
    authors: 'Mills O, Roberts F, Clarke V',
    year: 2022,
    journal: 'Spine Surgery',
    doi: '10.1097/BRS.0b013e3182471234',
    topicKeys: ['BMI+RPI', 'BMI+back'],
    abstract: 'Obese patients exhibited significantly reduced lumbar ROM (−22%, p<0.01) before and after intervention.'
  },
  {
    id: 'p24',
    title: 'Recovery Trajectory Prediction Using Baseline RPI and Comorbidity Data',
    authors: 'Ferguson U, Grant I, Hughes J',
    year: 2023,
    journal: 'Journal of Clinical Epidemiology',
    doi: '10.1016/j.jclinepi.2023.01.002',
    topicKeys: ['RPI+outcome', 'comorbidity+ROM'],
    abstract: 'Baseline RPI + comorbidity count predicted 6-month ROM recovery (R²=0.68, p<0.001).'
  },
  {
    id: 'p25',
    title: 'Integrated Physiotherapy and Medical Management in Shoulder Pain Syndrome',
    authors: 'Quinn T, Price D, Wilson H',
    year: 2023,
    journal: 'Best Practice & Research Clinical Rheumatology',
    doi: '10.1016/j.berh.2023.101754',
    topicKeys: ['physio+recovery', 'HTN+physio'],
    abstract: 'Integrated care reduced pain (−3.2 VAS points) and improved ROM vs. standard physiotherapy alone.'
  }
];

const JOURNALS: Journal[] = [
  {
    id: 'spine',
    name: 'Spine Journal',
    category: 'international',
    impactFactor: '3.1',
    wordLimit: 4500,
    abstractWords: 250,
    referenceFormat: 'Vancouver',
    guidelines: 'Structured abstract required (Background/Methods/Results/Conclusions). Methods must include IRB approval. ≤6 tables. CONSORT checklist for RCTs.'
  },
  {
    id: 'jospt',
    name: 'Journal of Orthopaedic & Sports Physical Therapy',
    category: 'international',
    impactFactor: '4.8',
    wordLimit: 4000,
    abstractWords: 275,
    referenceFormat: 'Vancouver',
    guidelines: 'Clinical commentary or research report. STROBE/CONSORT checklist required. Data sharing statement mandatory.'
  },
  {
    id: 'manual-therapy',
    name: 'Musculoskeletal Science & Practice',
    category: 'international',
    impactFactor: '2.4',
    wordLimit: 5000,
    abstractWords: 300,
    referenceFormat: 'Vancouver',
    guidelines: 'Highlights (3-5 bullet points) required. Open access available. Author contributions statement required.'
  },
  {
    id: 'ijpmr',
    name: 'Indian Journal of Physical Medicine & Rehabilitation',
    category: 'indian',
    wordLimit: 3500,
    abstractWords: 200,
    referenceFormat: 'Vancouver',
    guidelines: 'Authors must be registered physiotherapists or physicians. Hindi title and abstract accepted. Copyright transfer agreement required.'
  },
  {
    id: 'indian-j-orthop',
    name: 'Indian Journal of Orthopaedics',
    category: 'indian',
    impactFactor: '1.2',
    wordLimit: 3000,
    abstractWords: 200,
    referenceFormat: 'Vancouver',
    guidelines: 'Ethical committee certificate mandatory. Patient consent form (ICF) required. Case reports: ≤2 cases.'
  },
  {
    id: 'indian-spine',
    name: 'Indian Spine Journal',
    category: 'indian',
    wordLimit: 3500,
    abstractWords: 180,
    referenceFormat: 'APA',
    guidelines: 'Indian society members: ₹1,000 submission fee. Non-members: ₹2,500. Fast-track review available.'
  },
  {
    id: 'iapmr-conf',
    name: 'IAPMR Annual Conference 2024',
    category: 'conference',
    wordLimit: 500,
    abstractWords: 500,
    referenceFormat: 'APA',
    guidelines: 'Abstract only. Oral or poster format. Submission deadline: 15 Dec 2023. Notification: 31 Jan 2024.'
  },
  {
    id: 'wcpt',
    name: 'World Physiotherapy Congress 2025',
    category: 'conference',
    wordLimit: 1500,
    abstractWords: 350,
    referenceFormat: 'APA',
    guidelines: 'Structured abstract (Background/Objectives/Methods/Results/Conclusion). Video abstract option available.'
  },
  {
    id: 'ioa',
    name: 'Indian Orthopaedic Association Annual Conference',
    category: 'conference',
    wordLimit: 750,
    abstractWords: 400,
    referenceFormat: 'Vancouver',
    guidelines: 'Dual submission allowed (journal + conference). Oral presentation preferred for research.'
  },
  {
    id: 'hospital-bulletin',
    name: 'Hospital Research & Clinical Bulletin',
    category: 'internal',
    wordLimit: 2000,
    abstractWords: 150,
    referenceFormat: 'APA',
    guidelines: 'Internal peer review only. No IRB requirement for retrospective audits (n>10). Publication in institutional newsletter.'
  },
  {
    id: 'researchgate',
    name: 'ResearchGate Preprint',
    category: 'internal',
    wordLimit: 5000,
    abstractWords: 300,
    referenceFormat: 'APA',
    guidelines: 'No peer review; archival platform. Preprint improves visibility. Can be updated. Citable via DOI.'
  },
  {
    id: 'medrxiv',
    name: 'medRxiv Preprint Server',
    category: 'internal',
    wordLimit: 5000,
    abstractWords: 350,
    referenceFormat: 'Vancouver',
    guidelines: 'Rapid publication (1 day). Receives CrossRef DOI. Some journals restrict pre-publication.'
  }
];

// ===== HELPER FUNCTIONS =====

function parseResearchQuestion(title: string): ParsedQuestion {
  const lowerTitle = title.toLowerCase();

  const independentVarKeywords: Record<string, string> = {
    smoking: 'Smoking Status', htn: 'Hypertension Status', hypertension: 'Hypertension Status',
    bmi: 'Body Mass Index', 'body mass': 'Body Mass Index', age: 'Age', gender: 'Gender',
    comorbid: 'Comorbidity Count', exercise: 'Exercise Frequency'
  };

  const dependentVarKeywords: Record<string, string> = {
    rom: 'Range of Motion', 'range of motion': 'Range of Motion', 'range of': 'Range of Motion',
    physio: 'Physiotherapy Outcome', 'physical therapy': 'Physiotherapy Outcome',
    rpi: 'RPI Score', pain: 'Pain Severity', function: 'Functional Outcome',
    strength: 'Muscle Strength', recovery: 'Recovery Time'
  };

  let independentVar = 'Smoking Status';
  for (const [key, value] of Object.entries(independentVarKeywords)) {
    if (lowerTitle.includes(key)) {
      independentVar = value;
      break;
    }
  }

  let dependentVar = 'Range of Motion';
  for (const [key, value] of Object.entries(dependentVarKeywords)) {
    if (lowerTitle.includes(key)) {
      dependentVar = value;
      break;
    }
  }

  const populationMatches = lowerTitle.match(/(back|spine|shoulder|knee|neck|lumbar|cervical|thoracic)/gi);
  const ageMatches = lowerTitle.match(/(\d+[\s-]*\d+\s*(?:year|yrs?|age)|(?:middle|older|young|adult|geriatric|pediatric)[\s-]*aged?)/gi);

  let population = 'General musculoskeletal population';
  if (populationMatches) {
    const area = populationMatches[0].toLowerCase();
    if (area === 'back' || area === 'spine' || area === 'lumbar') {
      population = 'Patients with chronic back pain';
    } else if (area === 'shoulder') {
      population = 'Patients with shoulder pain/dysfunction';
    } else if (area === 'knee') {
      population = 'Patients with knee pain/dysfunction';
    }
  }
  if (ageMatches) {
    const age = ageMatches[0];
    if (age.includes('middle') || /40|50|60/.test(age)) {
      population = `${population.replace('Patients', 'Middle-aged patients')}`;
    }
  }

  let studyType: StudyType = 'cross-sectional';
  if (lowerTitle.includes('longitudinal') || lowerTitle.includes('follow') || lowerTitle.includes('over time')) {
    studyType = 'cohort';
  } else if (lowerTitle.includes('randomized') || lowerTitle.includes('rct')) {
    studyType = 'rct';
  }

  const indepTokens = independentVar.split(' ').slice(0, 1)[0].toLowerCase();
  const depTokens = dependentVar.split(' ').slice(0, 2).join('+').toLowerCase();
  const topicKey = `${indepTokens}+${depTokens}`;

  return {
    rawTitle: title,
    independentVar,
    dependentVar,
    population,
    studyType,
    topicKey
  };
}

function buildAnalysisCards(pq: ParsedQuestion): AnalysisCard[] {
  return [
    {
      id: 'simple-comparison',
      title: 'Simple Comparison',
      description: `Compare ${pq.dependentVar} between ${pq.independentVar} groups. Box plot, t-test, effect size.`,
      statsMethod: 'Independent t-test, Mann-Whitney U, Cohen\'s d',
      recommendedFor: 'Quick overview, clinically simple interpretation'
    },
    {
      id: 'dose-response',
      title: 'Dose-Response Regression',
      description: `${pq.dependentVar} as continuous function of ${pq.independentVar}. Scatter plot, regression, trend line.`,
      statsMethod: 'Linear/logistic regression, R², p-values, 95% CI',
      recommendedFor: 'Mechanistic insight, dose-response relationship'
    },
    {
      id: 'longitudinal',
      title: 'Longitudinal Comparison',
      description: `${pq.dependentVar} at baseline and follow-up. Group × Time interaction, repeated measures.`,
      statsMethod: 'Mixed models, repeated measures ANOVA, effect sizes',
      recommendedFor: 'Intervention effectiveness, trajectory analysis'
    }
  ];
}

function checkRequiredVariables(analysis: AnalysisOption): DataVariable[] {
  const allVars: DataVariable[] = [
    { name: 'Age', available: true, simulatable: false },
    { name: 'BMI', available: true, simulatable: false },
    { name: 'Hypertension Status', available: true, simulatable: false },
    { name: 'RPI Score', available: true, simulatable: false },
    { name: 'ROM (Flexion/Extension)', available: true, simulatable: false },
    { name: 'Physiotherapy Outcome Score', available: true, simulatable: false }
  ];

  if (analysis === 'dose-response') {
    allVars.push({ name: 'Smoking Status (Pack-Years)', available: false, simulatable: true });
  } else if (analysis === 'longitudinal') {
    allVars.push({ name: 'Baseline Assessment', available: true, simulatable: false });
    allVars.push({ name: 'Follow-up Assessment (6 months)', available: false, simulatable: true });
  }

  return allVars;
}

function selectMockPapers(topicKey: string): MockPaper[] {
  const tokens = topicKey.split('+').map(t => t.toLowerCase());
  const scored = MOCK_PAPERS.map(paper => ({
    paper,
    score: paper.topicKeys.reduce((acc, key) => {
      const keyTokens = key.split('+').map(t => t.toLowerCase());
      return acc + keyTokens.filter(kt => tokens.some(t => kt.includes(t) || t.includes(kt))).length;
    }, 0)
  }));

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(item => item.paper);
}

function formatReference(paper: MockPaper, format: ReferenceFormat): string {
  if (format === 'APA') {
    return `${paper.authors} (${paper.year}). ${paper.title}. ${paper.journal}. https://doi.org/${paper.doi}`;
  }
  return `${paper.authors}. ${paper.title}. ${paper.journal}. ${paper.year}. ${paper.doi}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function generatePaperContent(
  pq: ParsedQuestion,
  analysis: AnalysisCard,
  journal: Journal,
  papers: MockPaper[]
): PaperSections {
  const refList = papers.map((p, idx) => `[${idx + 1}] ${formatReference(p, journal.referenceFormat)}`).join('\n');

  return {
    abstract: `Background: ${pq.independentVar} is an important determinant of ${pq.dependentVar} in ${pq.population.toLowerCase()}. However, the magnitude and clinical significance of this relationship remains uncertain. Objectives: To examine the association between ${pq.independentVar} and ${pq.dependentVar}. Methods: Cross-sectional analysis of ${pq.studyType} design involving ${Math.floor(Math.random() * 200 + 80)} participants. ${analysis.statsMethod} was used for statistical analysis. Results: ${pq.independentVar} was significantly associated with ${pq.dependentVar} (p<0.05, effect size: moderate). Conclusion: These findings suggest that ${pq.independentVar} plays an important role in determining ${pq.dependentVar} and should be considered in clinical assessment and management protocols.`,

    introduction: `${pq.independentVar} is recognized as an important health factor in musculoskeletal medicine. The relationship between ${pq.independentVar} and ${pq.dependentVar} has been demonstrated in animal models and small clinical series, but large-scale evidence from the target population remains limited.\n\nThe burden of ${pq.population.toLowerCase()} continues to increase globally. Effective prognostication tools that account for relevant risk factors like ${pq.independentVar} could improve clinical outcomes by enabling targeted intervention strategies.\n\nWhile previous studies have examined individual predictors of ${pq.dependentVar}, few have comprehensively evaluated the role of ${pq.independentVar} while controlling for known confounders such as age, BMI, and comorbid conditions.\n\nThe primary objective of this study was to examine the independent association between ${pq.independentVar} and ${pq.dependentVar} in ${pq.population.toLowerCase()}. Secondary objectives included assessing whether this relationship is modified by age, BMI, or comorbidity status, and to estimate clinically meaningful effect sizes.`,

    methods: `Study Design and Setting: This was a ${pq.studyType} study conducted at a tertiary care musculoskeletal center between January 2022 and December 2023.\n\nParticipants: ${pq.population} (n=${Math.floor(Math.random() * 200 + 80)}) were enrolled. Inclusion criteria: age 18-75 years, confirmed clinical diagnosis, ability to provide written informed consent. Exclusion criteria: acute infection, malignancy, pregnancy, prior spinal surgery.\n\nData Collection: Standardized questionnaires captured ${pq.independentVar}, age, BMI, comorbidities, and medications. ${pq.dependentVar} was assessed using validated instruments.\n\nStatistical Analysis: ${analysis.statsMethod} was employed. Confounders (age, BMI, hypertension status) were included in adjusted models. P-values <0.05 were considered statistically significant. Effect sizes reported as ${analysis.id === 'simple-comparison' ? "Cohen's d" : analysis.id === 'dose-response' ? 'standardized regression coefficient' : 'eta-squared'}. All analyses conducted using R version 4.2.`,

    results: `Participant Characteristics: Mean age was ${Math.floor(Math.random() * 20 + 45)} years (SD=${Math.floor(Math.random() * 10 + 8)}). Gender distribution was approximately 55% female. Mean BMI was ${(Math.random() * 8 + 24).toFixed(1)} kg/m² (SD=3.4).\n\nPrimary Analysis: ${pq.independentVar} was significantly associated with ${pq.dependentVar} in unadjusted analysis (${analysis.id === 'simple-comparison' ? 't=' + (Math.random() * 5 + 2).toFixed(2) : 'r=' + (Math.random() * 0.5 + 0.3).toFixed(2)}, p=${(Math.random() * 0.02 + 0.001).toFixed(4)}). After adjusting for age, BMI, and comorbidity status, the association remained significant (${analysis.id === 'simple-comparison' ? 'Cohens d=0.68' : 'β=0.52'}, 95% CI: [0.42-0.62], p<0.001).\n\nSecondary Analyses: The effect of ${pq.independentVar} on ${pq.dependentVar} was not significantly modified by age (p=0.23) but showed modest modification by BMI status (interaction p=0.08).\n\nClinical Significance: Based on effect sizes and confidence intervals, the magnitude of the association between ${pq.independentVar} and ${pq.dependentVar} appears clinically meaningful, suggesting potential for targeted intervention strategies.`,

    discussion: `This study provides evidence that ${pq.independentVar} is an important determinant of ${pq.dependentVar} in ${pq.population.toLowerCase()}. The magnitude of the association (${analysis.id === 'simple-comparison' ? 'medium effect size' : 'moderate correlation'}) aligns with previous mechanistic studies in the literature [1-3].\n\nOur findings extend prior work by demonstrating that this relationship persists after adjustment for established confounders, suggesting an independent mechanistic pathway. The lack of significant age interaction (p=0.23) suggests that clinical recommendations regarding ${pq.independentVar} management can be applied across age groups, which has important implications for standardized practice guidelines.\n\nSeveral limitations warrant discussion. First, the cross-sectional design precludes causal inference. Second, we relied on self-reported ${pq.independentVar} data, which may be subject to recall bias. Third, generalizability to other populations remains unclear.\n\nFuture research should employ longitudinal designs to clarify causality, examine mechanisms through which ${pq.independentVar} affects ${pq.dependentVar}, and evaluate whether interventions targeting ${pq.independentVar} improve clinical outcomes. Clinical trials of ${pq.independentVar}-focused interventions are warranted.`,

    conclusion: `${pq.independentVar} is significantly and independently associated with ${pq.dependentVar} in ${pq.population.toLowerCase()}. These findings support consideration of ${pq.independentVar} status in clinical assessment protocols for this population. Further research is needed to determine whether intervention on ${pq.independentVar} improves patient outcomes.`,

    references: refList
  };
}

// ===== MAIN COMPONENT =====

export function ResearchPublicationGenerator() {
  // Tab navigation
  const [activeTab, setActiveTab] = useState<PubTab>('generate');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // Step 1
  const [rawTitle, setRawTitle] = useState('');
  const [parsedQuestion, setParsedQuestion] = useState<ParsedQuestion | null>(null);

  // Step 2
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisOption | null>(null);

  // Step 3
  const [dataAction, setDataAction] = useState<'simulate' | 'different' | 'stop' | null>(null);

  // Step 4
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [journalFilter, setJournalFilter] = useState<'all' | Journal['category']>('all');

  // Step 5
  const [genProgress, setGenProgress] = useState(0);
  const [genStage, setGenStage] = useState('');
  const [foundPapers, setFoundPapers] = useState<MockPaper[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Step 6
  const [paperSections, setPaperSections] = useState<PaperSections | null>(null);
  const [editingSection, setEditingSection] = useState<keyof PaperSections | null>(null);
  const [editBuffer, setEditBuffer] = useState('');

  // Drafts
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Load drafts on mount
  useEffect(() => {
    const stored = localStorage.getItem('msk_pub_drafts');
    if (stored) {
      try {
        setDrafts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load drafts', e);
      }
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Generate paper effect
  useEffect(() => {
    if (wizardStep === 5 && !isGenerating && selectedAnalysis && parsedQuestion && selectedJournal) {
      setIsGenerating(true);
      setGenProgress(0);
      setGenStage('');
      setFoundPapers([]);

      const schedule = [
        { ms: 0, progress: 5, stage: 'Connecting to PubMed database...' },
        { ms: 600, progress: 15, stage: 'Searching for relevant literature...' },
        { ms: 1400, progress: 28, stage: 'Found 1,247 candidate papers. Applying filters...' },
        { ms: 2200, progress: 42, stage: 'Selecting top papers by relevance and recency...', action: () => {
          const papers = selectMockPapers(parsedQuestion.topicKey);
          setFoundPapers(papers);
        }},
        { ms: 3000, progress: 55, stage: 'Generating Introduction section (800 words)...' },
        { ms: 3800, progress: 65, stage: 'Writing Methods section (1,200 words)...' },
        { ms: 4600, progress: 75, stage: 'Computing mock statistics and Results section...' },
        { ms: 5400, progress: 85, stage: 'Composing Discussion and Conclusion...' },
        { ms: 6200, progress: 94, stage: `Formatting references in ${selectedJournal.referenceFormat} style...` },
        { ms: 6800, progress: 100, stage: 'Paper generation complete!' },
        { ms: 7000, action: () => {
          const papers = foundPapers.length > 0 ? foundPapers : selectMockPapers(parsedQuestion.topicKey);
          const analysisCard = buildAnalysisCards(parsedQuestion)[
            selectedAnalysis === 'simple-comparison' ? 0 : selectedAnalysis === 'dose-response' ? 1 : 2
          ];
          const content = generatePaperContent(parsedQuestion, analysisCard, selectedJournal, papers);
          setPaperSections(content);
          setWizardStep(6);
        }}
      ];

      schedule.forEach(item => {
        if (item.progress !== undefined) {
          const timer = setTimeout(() => {
            setGenProgress(item.progress);
            setGenStage(item.stage);
            if (item.action) {
              item.action();
            }
          }, item.ms);
          timerRefs.current.push(timer);
        } else if (item.action) {
          const timer = setTimeout(item.action, item.ms);
          timerRefs.current.push(timer);
        }
      });
    }
  }, [wizardStep, isGenerating, selectedAnalysis, parsedQuestion, selectedJournal, foundPapers]);

  // Memos
  const analysisCards = useMemo(() => parsedQuestion ? buildAnalysisCards(parsedQuestion) : [], [parsedQuestion]);
  const requiredVariables = useMemo(() => selectedAnalysis ? checkRequiredVariables(selectedAnalysis) : [], [selectedAnalysis]);
  const filteredJournals = useMemo(() => journalFilter === 'all' ? JOURNALS : JOURNALS.filter(j => j.category === journalFilter), [journalFilter]);
  const totalWordCount = useMemo(() => paperSections ? Object.values(paperSections).reduce((sum, section) => sum + countWords(section), 0) : 0, [paperSections]);

  // Event handlers
  const handleAnalyzeQuestion = () => {
    if (!rawTitle.trim()) {
      alert('Please enter a research question');
      return;
    }
    const parsed = parseResearchQuestion(rawTitle);
    setParsedQuestion(parsed);
    setWizardStep(2);
  };

  const handleSelectAnalysis = (option: AnalysisOption) => {
    setSelectedAnalysis(option);
    setWizardStep(3);
  };

  const handleConfirmData = () => {
    setWizardStep(4);
  };

  const handleSelectJournal = (journal: Journal) => {
    setSelectedJournal(journal);
    setWizardStep(5);
  };

  const handleSaveSection = () => {
    if (editingSection && paperSections) {
      setPaperSections({
        ...paperSections,
        [editingSection]: editBuffer
      });
      setEditingSection(null);
    }
  };

  const handleSaveDraft = () => {
    if (!parsedQuestion || !paperSections || !selectedJournal) return;

    const draft: Draft = {
      id: `draft_${Date.now()}`,
      title: parsedQuestion.rawTitle,
      status: 'draft',
      content: paperSections,
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
      target: selectedJournal.name,
      wordCount: totalWordCount
    };

    const updated = [...drafts, draft];
    setDrafts(updated);
    localStorage.setItem('msk_pub_drafts', JSON.stringify(updated));
    alert('Draft saved successfully!');
  };

  const handleSubmitPaper = () => {
    const draft = drafts.find(d => d.title === parsedQuestion?.rawTitle && d.status === 'draft');
    if (draft) {
      draft.status = 'submitted';
      const updated = [...drafts];
      setDrafts(updated);
      localStorage.setItem('msk_pub_drafts', JSON.stringify(updated));
      alert('Paper submitted to journal!');
    }
  };

  const handleExportDOC = () => {
    if (!paperSections || !parsedQuestion || !selectedJournal) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${parsedQuestion.rawTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 1in; line-height: 1.5; }
          h1 { font-size: 16pt; text-align: center; margin-bottom: 12pt; }
          h2 { font-size: 13pt; margin-top: 18pt; margin-bottom: 6pt; font-weight: bold; }
          p { margin-bottom: 6pt; text-align: justify; }
          .metadata { font-size: 10pt; color: #666; margin-bottom: 24pt; }
        </style>
      </head>
      <body>
        <h1>${parsedQuestion.rawTitle}</h1>
        <div class="metadata">
          <p><strong>Target Journal:</strong> ${selectedJournal.name}</p>
          <p><strong>Word Count:</strong> ${totalWordCount}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <h2>Abstract</h2>
        <p>${paperSections.abstract}</p>

        <h2>Introduction</h2>
        <p>${paperSections.introduction}</p>

        <h2>Methods</h2>
        <p>${paperSections.methods}</p>

        <h2>Results</h2>
        <p>${paperSections.results}</p>

        <h2>Discussion</h2>
        <p>${paperSections.discussion}</p>

        <h2>Conclusion</h2>
        <p>${paperSections.conclusion}</p>

        <h2>References</h2>
        <p style="white-space: pre-wrap;">${paperSections.references}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['﻿', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${parsedQuestion.rawTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!paperSections || !parsedQuestion) return;

    const existing = document.getElementById('msk-print-style');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = 'msk-print-style';
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #msk-paper-preview {
          display: block !important;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
          color: #000;
        }
        #msk-paper-preview h1 { page-break-after: avoid; }
        #msk-paper-preview h2 { page-break-after: avoid; margin-top: 18pt; }
        #msk-paper-preview p { margin-bottom: 6pt; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    window.addEventListener('afterprint', () => {
      const styleEl = document.getElementById('msk-print-style');
      if (styleEl) styleEl.remove();
    }, { once: true });
  };

  const handleLoadDraft = (draft: Draft) => {
    setPaperSections(draft.content);
    setRawTitle(draft.title);
    const parsed = parseResearchQuestion(draft.title);
    setParsedQuestion(parsed);
    const journal = JOURNALS.find(j => j.name === draft.target);
    if (journal) setSelectedJournal(journal);
    setActiveTab('generate');
    setWizardStep(6);
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter(d => d.id !== draftId);
    setDrafts(updated);
    localStorage.setItem('msk_pub_drafts', JSON.stringify(updated));
  };

  // ===== RENDER FUNCTIONS =====

  const renderStep1 = () => (
    <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>STEP 1: Research Question</h3>
      <p style={{ fontSize: '13px', color: '#647281', margin: '0 0 12px 0' }}>Enter your research question as a title:</p>
      <textarea
        value={rawTitle}
        onChange={(e) => setRawTitle(e.target.value)}
        placeholder="Example: How Smoking impacts Range of Motion in Middle Aged Males"
        style={{
          width: '100%',
          minHeight: '100px',
          padding: '12px',
          border: '1px solid #D4DEE6',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: '"DM Sans", sans-serif',
          marginBottom: '16px',
          resize: 'vertical'
        }}
      />
      <button
        onClick={handleAnalyzeQuestion}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0D6A47',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600
        }}
      >
        🔍 Analyze Question
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ backgroundColor: '#C8E6D7', border: '1px solid #0D6A47', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0D6A47' }}>✓ Question Analyzed</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#1A2332' }}>
          <strong>Independent Variable:</strong> {parsedQuestion?.independentVar}<br/>
          <strong>Dependent Variable:</strong> {parsedQuestion?.dependentVar}<br/>
          <strong>Population:</strong> {parsedQuestion?.population}<br/>
          <strong>Study Type:</strong> {parsedQuestion?.studyType}
        </p>
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>STEP 2: Analysis Options</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {analysisCards.map(card => (
          <div key={card.id} style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0D6A47')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D4DEE6')}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{card.title}</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#647281' }}>{card.description}</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#647281' }}><strong>Method:</strong> {card.statsMethod}</p>
            <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#647281' }}><strong>Best for:</strong> {card.recommendedFor}</p>
            <button
              onClick={() => handleSelectAnalysis(card.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0D6A47',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Select Option
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>STEP 3: Data Points Validation</h3>

      <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #D4DEE6' }}>
            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#1A2332' }}>Variable</th>
            <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: '#1A2332' }}>In Your Data?</th>
          </tr>
        </thead>
        <tbody>
          {requiredVariables.map((variable, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #F0F5FA', backgroundColor: idx % 2 === 0 ? 'white' : '#F9FAFB' }}>
              <td style={{ padding: '8px', color: '#1A2332' }}>{variable.name}</td>
              <td style={{ textAlign: 'center', padding: '8px', color: variable.available ? '#0D6A47' : '#C84C3D', fontWeight: 600 }}>
                {variable.available ? '✓ Available' : '✗ NOT FOUND'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {requiredVariables.some(v => !v.available) && (
        <div style={{ backgroundColor: '#FFF7EB', border: '1px solid #FFB74D', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>⚠️ Missing Data Detected</p>
          <p style={{ fontSize: '12px', color: '#1A2332', margin: '0 0 16px 0' }}>Some required variables are not in your database. What would you like to do?</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <button
              onClick={() => { setDataAction('simulate'); handleConfirmData(); }}
              style={{
                textAlign: 'left',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #D4DEE6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#1A2332',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F5FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <strong>Simulate realistic data</strong> for demonstration (auto-generated based on your cohort)
            </button>
            <button
              onClick={() => { setDataAction('different'); handleConfirmData(); }}
              style={{
                textAlign: 'left',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #D4DEE6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#1A2332',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F5FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <strong>Use different analysis</strong> approach (choose different variables available in your data)
            </button>
            <button
              onClick={() => { setDataAction('stop'); }}
              style={{
                textAlign: 'left',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #D4DEE6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#1A2332',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F5FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <strong>Stop for now</strong> — I'll collect missing data and return later
            </button>
          </div>
        </div>
      )}

      {!requiredVariables.some(v => !v.available) && (
        <button
          onClick={handleConfirmData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          ✓ All Data Available - Proceed
        </button>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>STEP 4: Publication Target</h3>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setJournalFilter('all')}
          style={{
            padding: '8px 12px',
            backgroundColor: journalFilter === 'all' ? '#0D6A47' : '#F0F5FA',
            color: journalFilter === 'all' ? 'white' : '#1A2332',
            border: journalFilter === 'all' ? 'none' : '1px solid #D4DEE6',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          All
        </button>
        {(['international', 'indian', 'conference', 'internal'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setJournalFilter(cat)}
            style={{
              padding: '8px 12px',
              backgroundColor: journalFilter === cat ? '#0D6A47' : '#F0F5FA',
              color: journalFilter === cat ? 'white' : '#1A2332',
              border: journalFilter === cat ? 'none' : '1px solid #D4DEE6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {filteredJournals.map(journal => (
          <div
            key={journal.id}
            onClick={() => handleSelectJournal(journal)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0D6A47';
              e.currentTarget.style.backgroundColor = '#F0F5FA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D4DEE6';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
              {journal.name}
              {journal.impactFactor && <span style={{ fontSize: '11px', color: '#647281', fontWeight: 400, marginLeft: '8px' }}>IF: {journal.impactFactor}</span>}
            </h4>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#647281' }}>
              <strong>Word Limit:</strong> {journal.wordLimit} | <strong>Abstract:</strong> {journal.abstractWords} words | <strong>Format:</strong> {journal.referenceFormat}
            </p>
            <p style={{ margin: '0', fontSize: '11px', color: '#647281' }}>{journal.guidelines}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>Generation Progress</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0D6A47' }}>{genProgress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#D4DEE6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${genProgress}%`,
              height: '100%',
              backgroundColor: '#0D6A47',
              transition: 'width 0.4s ease-in-out'
            }} />
          </div>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#647281' }}>{genStage}</p>
      </div>

      {foundPapers.length > 0 && (
        <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>Found Papers ({foundPapers.length})</h4>
          {foundPapers.map((paper, idx) => (
            <div key={paper.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < foundPapers.length - 1 ? '1px solid #F0F5FA' : 'none' }}>
              <p style={{ margin: '0', fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>[{idx + 1}] {paper.title.substring(0, 80)}...</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#647281' }}>{paper.authors} ({paper.year}). {paper.journal}.</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ backgroundColor: '#C8E6D7', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#0D6A47', textAlign: 'center' }}>
        Generation in progress... Please wait.
      </div>
    </div>
  );

  const renderStep6 = () => {
    const sections: (keyof PaperSections)[] = ['abstract', 'introduction', 'methods', 'results', 'discussion', 'conclusion', 'references'];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
        {/* Left nav */}
        <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px', height: 'fit-content' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>Sections</h4>
          {sections.map(section => (
            <button
              key={section}
              onClick={() => {
                if (editingSection === section) return;
                setEditingSection(section);
                setEditBuffer(paperSections?.[section] || '');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                marginBottom: '4px',
                backgroundColor: editingSection === section ? '#0D6A47' : 'transparent',
                color: editingSection === section ? 'white' : '#1A2332',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
              <span style={{ fontSize: '10px', display: 'block', color: editingSection === section ? '#C8E6D7' : '#647281' }}>
                {paperSections ? countWords(paperSections[section]) : 0} words
              </span>
            </button>
          ))}
        </div>

        {/* Right content */}
        <div>
          {editingSection ? (
            <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
                  Editing {editingSection.charAt(0).toUpperCase() + editingSection.slice(1)}
                </h4>
                <span style={{ fontSize: '11px', color: '#647281' }}>{countWords(editBuffer)} words</span>
              </div>
              <textarea
                value={editBuffer}
                onChange={(e) => setEditBuffer(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '12px',
                  border: '1px solid #D4DEE6',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: '"DM Sans", sans-serif',
                  marginBottom: '12px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveSection}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0D6A47',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  ✓ Save
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F0F5FA',
                    color: '#1A2332',
                    border: '1px solid #D4DEE6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 700, color: '#1A2332' }}>{parsedQuestion?.rawTitle}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#647281' }}>
                    {selectedJournal?.name} | {totalWordCount} words
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleExportDOC} style={{ padding: '8px 12px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    📄 DOCX
                  </button>
                  <button onClick={handleExportPDF} style={{ padding: '8px 12px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    📕 PDF
                  </button>
                  <button onClick={handleSaveDraft} style={{ padding: '8px 12px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    💾 Save Draft
                  </button>
                </div>
              </div>

              {editingSection === null && paperSections && (
                <div id="msk-paper-preview" style={{ fontSize: '13px', lineHeight: '1.6', color: '#1A2332', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Abstract</h2>
                  <p>{paperSections.abstract}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Introduction</h2>
                  <p>{paperSections.introduction}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Methods</h2>
                  <p>{paperSections.methods}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Results</h2>
                  <p>{paperSections.results}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Discussion</h2>
                  <p>{paperSections.discussion}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Conclusion</h2>
                  <p>{paperSections.conclusion}</p>

                  <h2 style={{ fontSize: '14px', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>References</h2>
                  <p>{paperSections.references}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDraftsTab = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>My Drafts</h3>
      {drafts.length === 0 ? (
        <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#647281' }}>No drafts yet. Start generating your first paper!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {drafts.map(draft => (
            <div key={draft.id} style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: '0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{draft.title}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#647281' }}>
                    {draft.target} | {draft.wordCount} words | Created {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: draft.status === 'draft' ? '#F0F5FA' : draft.status === 'submitted' ? '#C8E6D7' : '#E6F3FF',
                  color: draft.status === 'draft' ? '#1A2332' : draft.status === 'submitted' ? '#0D6A47' : '#1A5E7A'
                }}>
                  {draft.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => handleLoadDraft(draft)}
                  style={{ padding: '6px 12px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  Open
                </button>
                <button
                  onClick={() => handleDeleteDraft(draft.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#F0F5FA', color: '#C84C3D', border: '1px solid #D4DEE6', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubmittedTab = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Submitted Papers</h3>
      {drafts.filter(d => d.status !== 'draft').length === 0 ? (
        <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#647281' }}>No submitted papers yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {drafts.filter(d => d.status !== 'draft').map(draft => (
            <div key={draft.id} style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{draft.title}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#647281' }}>
                    {draft.target} | Submitted {new Date(draft.lastEditedAt).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#C8E6D7', color: '#0D6A47' }}>
                  UNDER REVIEW
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A2332', margin: '0 0 8px 0' }}>Research Publication</h1>
        <p style={{ fontSize: '14px', color: '#647281', margin: 0 }}>Generate scientific papers from your data and submit to journals</p>
      </div>

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #D4DEE6', paddingBottom: '16px' }}>
        <button
          onClick={() => { setActiveTab('generate'); setWizardStep(1); }}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: activeTab === 'generate' ? '#0D6A47' : 'transparent',
            color: activeTab === 'generate' ? 'white' : '#647281',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          ✍️ Generate New Paper
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: activeTab === 'drafts' ? '#0D6A47' : 'transparent',
            color: activeTab === 'drafts' ? 'white' : '#647281',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📋 My Drafts {drafts.length > 0 && `(${drafts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: activeTab === 'submitted' ? '#0D6A47' : 'transparent',
            color: activeTab === 'submitted' ? 'white' : '#647281',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📤 Submitted
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && (
        <div>
          {/* Step Indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div
                key={step}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: wizardStep >= step ? (wizardStep === step ? '#0D6A47' : '#C8E6D7') : '#F0F5FA',
                  color: wizardStep >= step ? (wizardStep === step ? 'white' : '#0D6A47') : '#647281',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  minWidth: '40px'
                }}
              >
                {step}
              </div>
            ))}
          </div>

          {/* Wizard Steps */}
          {wizardStep === 1 && renderStep1()}
          {wizardStep === 2 && renderStep2()}
          {wizardStep === 3 && renderStep3()}
          {wizardStep === 4 && renderStep4()}
          {wizardStep === 5 && renderStep5()}
          {wizardStep === 6 && renderStep6()}

          {/* Navigation Buttons */}
          {wizardStep < 6 && wizardStep !== 5 && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button
                onClick={() => wizardStep > 1 && setWizardStep((wizardStep - 1) as WizardStep)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: wizardStep === 1 ? '#F0F5FA' : 'white',
                  color: wizardStep === 1 ? '#999' : '#1A2332',
                  border: '1px solid #D4DEE6',
                  borderRadius: '8px',
                  cursor: wizardStep === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: wizardStep === 1 ? 0.5 : 1
                }}
                disabled={wizardStep === 1}
              >
                ← Back
              </button>
              {wizardStep === 3 && dataAction && (
                <button
                  onClick={handleConfirmData}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0D6A47',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && renderDraftsTab()}
      {activeTab === 'submitted' && renderSubmittedTab()}
    </div>
  );
}
