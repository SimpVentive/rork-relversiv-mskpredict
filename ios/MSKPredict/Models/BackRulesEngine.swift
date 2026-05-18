//
//  BackRulesEngine.swift
//  MSKPredict
//
//  Explainable rules engine for Back Pain prognosis, operating on the
//  locked BackAssessment schema. Produces a weighted score, a Red/Amber/Green
//  predicted call, and the list of fired rules for clinician transparency.
//

import Foundation

enum BackRulesEngine {

    // MARK: Back-specific rule catalogue (B-xxx)
    static let rules: [ClinicalRule] = [
        // RED FLAGS
        .init(id: "B-001", name: "Cauda Equina Suspicion",
              category: .redFlag,
              description: "Saddle anesthesia, bowel/bladder dysfunction, or bilateral neurology.",
              weight: 40),
        .init(id: "B-002", name: "Loss of Neurological Function",
              category: .redFlag,
              description: "Decreased sensation, strength, or reflexes on screening.",
              weight: 22),
        .init(id: "B-003", name: "Night Pain",
              category: .redFlag,
              description: "Unrelenting pain at night — screen for infection / malignancy.",
              weight: 14),
        .init(id: "B-004", name: "Active Malignancy",
              category: .redFlag,
              description: "History of cancer with new spinal pain.",
              weight: 18),

        // CLINICAL
        .init(id: "B-010", name: "STarT Back High Risk",
              category: .clinical,
              description: "STarT Back tool raw score ≥ 5.",
              weight: 18),
        .init(id: "B-011", name: "STarT Back Moderate",
              category: .clinical,
              description: "STarT Back raw score = 4.",
              weight: 10),
        .init(id: "B-012", name: "High Pain Intensity",
              category: .clinical,
              description: "VAS pain ≥ 7/10.",
              weight: 12),
        .init(id: "B-013", name: "Chronic Duration",
              category: .clinical,
              description: "Symptoms persisting > 12 weeks.",
              weight: 14),
        .init(id: "B-014", name: "Radicular Pattern",
              category: .clinical,
              description: "Pain radiating into the lower limb.",
              weight: 14),
        .init(id: "B-015", name: "Severe Disability",
              category: .clinical,
              description: "Disability reported as Severe or Disabling.",
              weight: 12),
        .init(id: "B-016", name: "Morning Stiffness > 30 min",
              category: .clinical,
              description: "Prolonged morning stiffness — inflammatory pattern.",
              weight: 8),
        .init(id: "B-017", name: "Reduced Lumbar Flexion",
              category: .clinical,
              description: "ROM flexion scale ≥ 2 (marked limitation).",
              weight: 8),
        .init(id: "B-018", name: "SLR Limitation",
              category: .clinical,
              description: "Straight Leg Raise positive on either side.",
              weight: 10),
        .init(id: "B-019", name: "FABER / FAIR Positive",
              category: .clinical,
              description: "Positive hip / SI provocation testing.",
              weight: 6),
        .init(id: "B-020", name: "Marked Muscle Tenderness",
              category: .clinical,
              description: "Graded muscle tenderness scored 5.",
              weight: 6),
        .init(id: "B-021", name: "Facet / SI Joint Tenderness",
              category: .clinical,
              description: "Palpation positive at facet or sacroiliac joints.",
              weight: 5),
        .init(id: "B-022", name: "MRI Disc Extrusion",
              category: .clinical,
              description: "Imaging-confirmed disc extrusion.",
              weight: 14),
        .init(id: "B-023", name: "Postural Decompensation",
              category: .clinical,
              description: "Loss of lordosis, scoliosis, or kyphosis observed.",
              weight: 6),

        // DEMOGRAPHIC
        .init(id: "B-030", name: "Older Adult (≥60)",
              category: .demographic,
              description: "Age 60+ increases degenerative risk.",
              weight: 7),
        .init(id: "B-031", name: "Previous Back Surgery",
              category: .demographic,
              description: "Prior spinal surgery in history.",
              weight: 10),
        .init(id: "B-032", name: "Previous Back Injury",
              category: .demographic,
              description: "Prior significant back injury.",
              weight: 6),

        // LIFESTYLE
        .init(id: "B-040", name: "Elevated BMI",
              category: .lifestyle,
              description: "BMI ≥ 30 increases mechanical load.",
              weight: 7),
        .init(id: "B-041", name: "Active Smoker",
              category: .lifestyle,
              description: "Regular or heavy smoking impairs healing.",
              weight: 6),
        .init(id: "B-042", name: "Prolonged Static Posture",
              category: .lifestyle,
              description: "≥5 hrs/day standing or sitting without breaks.",
              weight: 6),
        .init(id: "B-043", name: "Poor Ergonomics",
              category: .lifestyle,
              description: "Self-reported poor or fair workstation setup.",
              weight: 5),
        .init(id: "B-044", name: "Sedentary",
              category: .lifestyle,
              description: "Exercise frequency Never / Rare.",
              weight: 6),
        .init(id: "B-045", name: "Frequent Heavy Lifting",
              category: .lifestyle,
              description: "Frequent manual handling exposure.",
              weight: 6),
        .init(id: "B-046", name: "Improper Lifting Technique",
              category: .lifestyle,
              description: "Reports incorrect lifting biomechanics.",
              weight: 4),
        .init(id: "B-047", name: "Poor Sleep",
              category: .lifestyle,
              description: "Sleep quality poor or <6h per night.",
              weight: 5),

        // PSYCHOSOCIAL
        .init(id: "B-050", name: "High Job Stress",
              category: .psychosocial,
              description: "Job stress score ≥ 7/10.",
              weight: 7),
        .init(id: "B-051", name: "High Life Stress",
              category: .psychosocial,
              description: "Life stress score ≥ 7/10.",
              weight: 6),
        .init(id: "B-052", name: "Mental Health Disorder",
              category: .psychosocial,
              description: "Active anxiety, depression, or other diagnosis.",
              weight: 8),

        // COMORBIDITIES
        .init(id: "B-060", name: "Osteoporosis",
              category: .clinical,
              description: "Diagnosed osteoporosis — fracture risk.",
              weight: 10),
        .init(id: "B-061", name: "Severe Osteoarthritis",
              category: .clinical,
              description: "OA reported as Severe.",
              weight: 8),
        .init(id: "B-062", name: "Inflammatory Arthritis",
              category: .clinical,
              description: "Rheumatoid arthritis present.",
              weight: 8),
        .init(id: "B-063", name: "Diabetes",
              category: .clinical,
              description: "Diabetes impacts healing and neuropathy risk.",
              weight: 5)
    ]

    // MARK: Evaluation

    static func evaluate(_ a: BackAssessment) -> PredictionResult {
        var fired: [FiredRule] = []

        func fire(_ id: String, _ evidence: String) {
            if let r = rules.first(where: { $0.id == id }) {
                fired.append(.init(rule: r, evidence: evidence))
            }
        }

        // Red flags
        let neuroDeficit = !a.physioExam.sensationIntact || !a.physioExam.strengthNormal || !a.physioExam.reflexesNormal
        let cauda = neuroDeficit && (a.physioExam.slrLeft.graded == .five && a.physioExam.slrRight.graded == .five)
        if cauda {
            fire("B-001", "Bilateral SLR + neurological deficit.")
        }
        if neuroDeficit && !cauda {
            var parts: [String] = []
            if !a.physioExam.sensationIntact { parts.append("sensation") }
            if !a.physioExam.strengthNormal { parts.append("strength") }
            if !a.physioExam.reflexesNormal { parts.append("reflexes") }
            fire("B-002", "Abnormal: \(parts.joined(separator: ", ")).")
        }
        if a.clinical.nightPain {
            fire("B-003", "Patient reports night pain.")
        }
        if a.comorbidities.cancer {
            fire("B-004", "Active or prior cancer documented.")
        }

        // STarT Back
        if a.startBack.rawScore >= 5 {
            fire("B-010", "STarT Back score = \(a.startBack.rawScore).")
        } else if a.startBack.rawScore == 4 {
            fire("B-011", "STarT Back score = 4.")
        }

        // Pain
        if a.clinical.painIntensity >= 7 {
            fire("B-012", "VAS pain = \(a.clinical.painIntensity)/10.")
        }
        if a.clinical.painDuration.localizedCaseInsensitiveContains("Chronic") {
            fire("B-013", "Chronic duration reported.")
        }
        if a.clinical.painRadiation {
            fire("B-014", "Radiation: \(a.clinical.painRadiationLocation.isEmpty ? "lower limb" : a.clinical.painRadiationLocation).")
        }
        if a.clinical.disabilityLevel == "Severe" || a.clinical.disabilityLevel == "Disabling" {
            fire("B-015", "Disability: \(a.clinical.disabilityLevel).")
        }
        if a.clinical.morningStiffness && a.clinical.morningStiffnessMinutes >= 30 {
            fire("B-016", "Morning stiffness ~\(a.clinical.morningStiffnessMinutes) min.")
        }

        // ROM
        if a.rom.flexion.scale >= 2 {
            fire("B-017", "Flexion scale \(a.rom.flexion.scale) at \(Int(a.rom.flexion.angleDegrees))°.")
        }

        // Special tests
        if a.physioExam.slrLeft.graded != .zero || a.physioExam.slrRight.graded != .zero {
            fire("B-018", "SLR L=\(a.physioExam.slrLeft.graded.rawValue), R=\(a.physioExam.slrRight.graded.rawValue).")
        }
        if a.physioExam.faberLeft.graded != .zero || a.physioExam.faberRight.graded != .zero || a.physioExam.fair.graded != .zero {
            fire("B-019", "FABER/FAIR provocation positive.")
        }
        if a.physioExam.muscleTenderness.graded == .five {
            fire("B-020", "Marked tenderness at \(a.physioExam.muscleTenderness.location).")
        }
        if a.physioExam.facetJointTenderness || a.physioExam.sacroiliacJointTenderness {
            fire("B-021", "Joint palpation positive.")
        }
        if a.investigations.mriDone && a.investigations.mriDiscHerniationSeverity == "Extrusion" {
            fire("B-022", "MRI: extrusion at \(a.investigations.mriDiscHerniationLevel).")
        }
        if a.physioExam.scoliosis || a.physioExam.lossOfLumbarLordosis || a.physioExam.increasedThoracicKyphosis {
            fire("B-023", "Postural deviation observed.")
        }

        // Demographics
        if a.demographics.age >= 60 { fire("B-030", "Age = \(a.demographics.age).") }
        if a.comorbidities.previousBackSurgery { fire("B-031", "Prior spinal surgery.") }
        if a.comorbidities.previousBackInjury { fire("B-032", "Prior back injury.") }

        // Lifestyle
        if a.demographics.bmi >= 30 { fire("B-040", "BMI = \(String(format: "%.1f", a.demographics.bmi)).") }
        if a.lifestyle.smokingStatus == "Regular" || a.lifestyle.smokingStatus == "Heavy" {
            fire("B-041", "\(a.lifestyle.smokingStatus) smoker — \(a.lifestyle.cigarettesPerDay)/day.")
        }
        if a.lifestyle.standing5Plus || a.lifestyle.sitting5Plus {
            fire("B-042", "Static posture ≥5 hrs/day.")
        }
        if a.lifestyle.deskErgonomics == "Poor" || a.lifestyle.deskErgonomics == "Fair" {
            fire("B-043", "Ergonomics: \(a.lifestyle.deskErgonomics).")
        }
        if a.lifestyle.exerciseFrequency == "Never" || a.lifestyle.exerciseFrequency == "Rare" {
            fire("B-044", "Exercise: \(a.lifestyle.exerciseFrequency).")
        }
        if a.lifestyle.heavyLiftingFrequency == "Frequent" { fire("B-045", "Frequent heavy lifting.") }
        if !a.lifestyle.properLiftingTechnique { fire("B-046", "Lifting technique flagged.") }
        if a.lifestyle.sleepQuality == "Poor" || a.lifestyle.sleepHoursPerNight < 6 {
            fire("B-047", "Sleep: \(a.lifestyle.sleepQuality), \(a.lifestyle.sleepHoursPerNight)h.")
        }

        // Psychosocial
        if a.lifestyle.jobStressLevel >= 7 { fire("B-050", "Job stress = \(a.lifestyle.jobStressLevel)/10.") }
        if a.lifestyle.lifeStressLevel >= 7 { fire("B-051", "Life stress = \(a.lifestyle.lifeStressLevel)/10.") }
        if a.comorbidities.mentalHealthDisorder { fire("B-052", "Mental health disorder reported.") }

        // Comorbidities
        if a.comorbidities.osteoporosis { fire("B-060", "Osteoporosis documented.") }
        if a.comorbidities.osteoarthritis && a.comorbidities.osteoarthritisSeverity == "Severe" {
            fire("B-061", "Severe osteoarthritis.")
        }
        if a.comorbidities.rheumatoidArthritis { fire("B-062", "Rheumatoid arthritis.") }
        if a.comorbidities.diabetes { fire("B-063", "Diabetes (\(a.comorbidities.diabetesType)).") }

        // Score & band
        let raw = fired.map(\.rule.weight).reduce(0, +)
        let score = min(100, raw)
        let band: RiskBand
        switch score {
        case 0..<20: band = .low
        case 20..<45: band = .moderate
        case 45..<70: band = .high
        default: band = .veryHigh
        }
        let call: ClinicianCall
        switch band {
        case .low: call = .green
        case .moderate: call = .amber
        case .high, .veryHigh: call = .red
        }

        // Chronicity weeks (estimate from category)
        let chronicity: Int = {
            switch a.clinical.painDuration {
            case let s where s.contains("Acute"): return 3
            case let s where s.contains("Subacute"): return 8
            case let s where s.contains("Chronic"): return 16
            default: return 6
            }
        }()

        return PredictionResult(
            createdAt: .now,
            region: .lowerBack,
            score: score,
            band: band,
            firedRules: fired,
            chronicityWeeks: chronicity,
            predictedCall: call,
            condition: .back
        )
    }
}
