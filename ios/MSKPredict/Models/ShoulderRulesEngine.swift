//
//  ShoulderRulesEngine.swift
//  MSKPredict
//
//  Explainable rules engine for Shoulder Pain prognosis, operating on the
//  locked ShoulderAssessment schema.
//

import Foundation

enum ShoulderRulesEngine {

    // MARK: Shoulder rule catalogue (S-xxx)
    static let rules: [ClinicalRule] = [
        // RED FLAGS
        .init(id: "S-001", name: "Neurological Deficit",
              category: .redFlag,
              description: "Decreased sensation or generalised weakness on screening.",
              weight: 22),
        .init(id: "S-002", name: "Night Pain",
              category: .redFlag,
              description: "Unrelenting shoulder pain at night — screen for serious pathology.",
              weight: 14),
        .init(id: "S-003", name: "Active Malignancy History",
              category: .redFlag,
              description: "Prior cancer with new shoulder pain warrants imaging.",
              weight: 16),
        .init(id: "S-004", name: "Drop Arm Positive",
              category: .redFlag,
              description: "Positive drop arm test — full-thickness rotator cuff tear suspicion.",
              weight: 20),

        // CLINICAL
        .init(id: "S-010", name: "High Pain Intensity",
              category: .clinical,
              description: "VAS pain ≥ 7/10.",
              weight: 12),
        .init(id: "S-011", name: "Chronic Duration",
              category: .clinical,
              description: "Symptoms persisting > 12 weeks.",
              weight: 14),
        .init(id: "S-012", name: "Severe Functional Limitation",
              category: .clinical,
              description: "Self-reported functional limitation ≥ 7/10.",
              weight: 10),
        .init(id: "S-013", name: "Severe Disability",
              category: .clinical,
              description: "Disability rated Severe or Disabling.",
              weight: 12),
        .init(id: "S-014", name: "Pain Radiation",
              category: .clinical,
              description: "Pain radiates down the arm.",
              weight: 8),
        .init(id: "S-015", name: "Impingement Pattern",
              category: .clinical,
              description: "Positive Hawkins-Kennedy or Neer impingement test.",
              weight: 10),
        .init(id: "S-016", name: "Labral / Biceps Pathology",
              category: .clinical,
              description: "Positive O'Brien active compression test.",
              weight: 8),
        .init(id: "S-017", name: "Rotator Cuff Weakness",
              category: .clinical,
              description: "Manual muscle test ≤ 3/5 for any rotator cuff muscle.",
              weight: 14),
        .init(id: "S-018", name: "Reduced Shoulder Elevation",
              category: .clinical,
              description: "Flexion or abduction scale ≥ 2 (marked limitation).",
              weight: 10),
        .init(id: "S-019", name: "Marked Tenderness",
              category: .clinical,
              description: "Graded muscle tenderness scored 5.",
              weight: 6),
        .init(id: "S-020", name: "Scapular Dysfunction",
              category: .clinical,
              description: "Scapular winging or rounded shoulders observed.",
              weight: 6),
        .init(id: "S-021", name: "Instability / Catching",
              category: .clinical,
              description: "Patient reports clicking, catching, or instability.",
              weight: 8),
        .init(id: "S-022", name: "MRI Rotator Cuff Tear",
              category: .clinical,
              description: "Imaging-confirmed rotator cuff tear or significant tendinopathy.",
              weight: 14),
        .init(id: "S-023", name: "MRI Labral Lesion",
              category: .clinical,
              description: "Imaging-confirmed SLAP or Bankart lesion.",
              weight: 10),

        // DEMOGRAPHIC
        .init(id: "S-030", name: "Older Adult (≥60)",
              category: .demographic,
              description: "Age 60+ increases cuff degeneration risk.",
              weight: 7),
        .init(id: "S-031", name: "Previous Shoulder Surgery",
              category: .demographic,
              description: "Prior shoulder surgery in history.",
              weight: 10),
        .init(id: "S-032", name: "Previous Shoulder Injury",
              category: .demographic,
              description: "Prior significant shoulder injury.",
              weight: 6),

        // LIFESTYLE / OCCUPATIONAL
        .init(id: "S-040", name: "Elevated BMI",
              category: .lifestyle,
              description: "BMI ≥ 30 increases joint load.",
              weight: 5),
        .init(id: "S-041", name: "Active Smoker",
              category: .lifestyle,
              description: "Regular or heavy smoking impairs tendon healing.",
              weight: 6),
        .init(id: "S-042", name: "Frequent Overhead Work",
              category: .lifestyle,
              description: "≥4 hrs/day overhead activity at work.",
              weight: 8),
        .init(id: "S-043", name: "Frequent Lifting",
              category: .lifestyle,
              description: "Frequent or constant manual lifting exposure.",
              weight: 6),
        .init(id: "S-044", name: "Repetitive Arm Motion",
              category: .lifestyle,
              description: "Repetitive arm motion or throwing activities.",
              weight: 6),
        .init(id: "S-045", name: "Poor Ergonomics",
              category: .lifestyle,
              description: "Inappropriate desk / keyboard / mouse / monitor positioning.",
              weight: 5),
        .init(id: "S-046", name: "Sedentary",
              category: .lifestyle,
              description: "Exercise frequency Never / Rare.",
              weight: 5),
        .init(id: "S-047", name: "Sleep Disturbance",
              category: .lifestyle,
              description: "Shoulder pain disrupts sleep or sleep quality poor.",
              weight: 6),

        // PSYCHOSOCIAL
        .init(id: "S-050", name: "High Job Stress",
              category: .psychosocial,
              description: "Job stress score ≥ 7/10.",
              weight: 6),
        .init(id: "S-051", name: "High Life Stress",
              category: .psychosocial,
              description: "Life stress score ≥ 7/10.",
              weight: 6),
        .init(id: "S-052", name: "Mental Health Disorder",
              category: .psychosocial,
              description: "Active anxiety, depression, or other diagnosis.",
              weight: 8),

        // COMORBIDITIES
        .init(id: "S-060", name: "Diabetes",
              category: .clinical,
              description: "Diabetes increases adhesive capsulitis and tendinopathy risk.",
              weight: 8),
        .init(id: "S-061", name: "Inflammatory Arthritis",
              category: .clinical,
              description: "Rheumatoid arthritis present.",
              weight: 8),
        .init(id: "S-062", name: "Osteoarthritis",
              category: .clinical,
              description: "Glenohumeral or AC joint OA documented.",
              weight: 6),
        .init(id: "S-063", name: "Thyroid Disorder",
              category: .clinical,
              description: "Thyroid disorder linked to frozen shoulder risk.",
              weight: 5)
    ]

    // MARK: Evaluation

    static func evaluate(_ a: ShoulderAssessment) -> PredictionResult {
        var fired: [FiredRule] = []
        func fire(_ id: String, _ evidence: String) {
            if let r = rules.first(where: { $0.id == id }) {
                fired.append(.init(rule: r, evidence: evidence))
            }
        }

        // Red flags
        let neuroDeficit = !a.physioExam.sensationIntact || !a.physioExam.strengthNormal
        if neuroDeficit {
            var parts: [String] = []
            if !a.physioExam.sensationIntact { parts.append("sensation") }
            if !a.physioExam.strengthNormal { parts.append("strength") }
            fire("S-001", "Abnormal: \(parts.joined(separator: ", ")).")
        }
        if a.shoulderPain.nightPain {
            fire("S-002", "Patient reports night pain.")
        }
        // (No explicit cancer field on shoulder schema, so S-003 only fires via clinician notes context — keep latent.)
        if a.physioExam.dropArm.graded == .five {
            fire("S-004", "Drop arm positive (graded 5).")
        }

        // Clinical
        if a.shoulderPain.painIntensity >= 7 {
            fire("S-010", "VAS pain = \(a.shoulderPain.painIntensity)/10.")
        }
        if a.shoulderPain.painDuration.localizedCaseInsensitiveContains("Chronic") {
            fire("S-011", "Chronic duration reported.")
        }
        if a.shoulderPain.functionalLimitation >= 7 {
            fire("S-012", "Functional limitation = \(a.shoulderPain.functionalLimitation)/10.")
        }
        if a.clinical.disabilityLevel == "Severe" || a.clinical.disabilityLevel == "Disabling" {
            fire("S-013", "Disability: \(a.clinical.disabilityLevel).")
        }
        if a.shoulderPain.painRadiation {
            let where_ = a.shoulderPain.painRadiationLocation.isEmpty ? "down arm" : a.shoulderPain.painRadiationLocation
            fire("S-014", "Radiation: \(where_).")
        }

        if a.physioExam.impingementTest.graded != .zero || a.physioExam.hawkinsKennedy.graded != .zero {
            fire("S-015", "Impingement provocation positive.")
        }
        if a.physioExam.obrien.graded != .zero {
            fire("S-016", "O'Brien test positive.")
        }
        let cuffWeak = min(a.physioExam.supraspinatusStrength,
                           min(a.physioExam.infraspinatusStrength, a.physioExam.subscapularisStrength))
        if cuffWeak <= 3 {
            fire("S-017", "Cuff MMT min = \(cuffWeak)/5.")
        }
        if a.rom.flexion.scale >= 2 || a.rom.abduction.scale >= 2 {
            fire("S-018", "Flexion s\(a.rom.flexion.scale) · Abd s\(a.rom.abduction.scale).")
        }
        if a.physioExam.muscleTenderness.graded == .five {
            fire("S-019", "Marked tenderness at \(a.physioExam.muscleTenderness.location).")
        }
        if a.physioExam.scapularWinging || a.physioExam.roundedShoulders {
            fire("S-020", "Scapular / posture deviation observed.")
        }
        if a.clinical.clickingClunking || a.clinical.catchingSensation || a.clinical.instabilityFeeling {
            fire("S-021", "Reports clicking / catching / instability.")
        }
        if a.investigations.mriDone && !a.investigations.mriRotatorCuffFindings.isEmpty {
            fire("S-022", "MRI cuff: \(a.investigations.mriRotatorCuffFindings).")
        }
        if a.investigations.mriDone && !a.investigations.mriLabralFindings.isEmpty {
            fire("S-023", "MRI labral: \(a.investigations.mriLabralFindings).")
        }

        // Demographics
        if a.demographics.age >= 60 { fire("S-030", "Age = \(a.demographics.age).") }
        if a.comorbidities.previousShoulderSurgery { fire("S-031", "Prior shoulder surgery.") }
        if a.comorbidities.previousShoulderInjury { fire("S-032", "Prior shoulder injury.") }

        // Lifestyle / occupational
        if a.demographics.bmi >= 30 { fire("S-040", "BMI = \(String(format: "%.1f", a.demographics.bmi)).") }
        if a.lifestyle.smokingStatus == "Regular" || a.lifestyle.smokingStatus == "Heavy" {
            fire("S-041", "\(a.lifestyle.smokingStatus) smoker — \(a.lifestyle.cigarettesPerDay)/day.")
        }
        if a.lifestyle.overheadWorkHoursPerDay >= 4 {
            fire("S-042", "Overhead work \(a.lifestyle.overheadWorkHoursPerDay) hrs/day.")
        }
        if a.lifestyle.liftingFrequency == "Frequent" || a.lifestyle.liftingFrequency == "Constant" {
            fire("S-043", "Lifting: \(a.lifestyle.liftingFrequency) (\(a.lifestyle.liftingWeightKg)kg).")
        }
        if a.lifestyle.repetitiveArmMotion || a.lifestyle.throwingActivities {
            fire("S-044", "Repetitive arm / throwing motion.")
        }
        let ergoBad = !a.lifestyle.deskHeightAppropriate
            || !a.lifestyle.keyboardPositionAppropriate
            || !a.lifestyle.mousePositionAppropriate
            || !a.lifestyle.monitorHeightAppropriate
            || a.lifestyle.chairArmrestHeight != "Appropriate"
        if ergoBad { fire("S-045", "Workstation ergonomics flagged.") }
        if a.lifestyle.exerciseFrequency == "Never" || a.lifestyle.exerciseFrequency == "Rare" {
            fire("S-046", "Exercise: \(a.lifestyle.exerciseFrequency).")
        }
        if a.lifestyle.shoulderPainAffectsSleep || a.lifestyle.sleepQuality == "Poor" || a.lifestyle.sleepHoursPerNight < 6 {
            fire("S-047", "Sleep: \(a.lifestyle.sleepQuality), \(a.lifestyle.sleepHoursPerNight)h.")
        }

        // Psychosocial
        if a.lifestyle.jobStressLevel >= 7 { fire("S-050", "Job stress = \(a.lifestyle.jobStressLevel)/10.") }
        if a.lifestyle.lifeStressLevel >= 7 { fire("S-051", "Life stress = \(a.lifestyle.lifeStressLevel)/10.") }
        if a.comorbidities.mentalHealthDisorder { fire("S-052", "Mental health disorder reported.") }

        // Comorbidities
        if a.comorbidities.diabetes { fire("S-060", "Diabetes documented.") }
        if a.comorbidities.rheumatoidArthritis { fire("S-061", "Rheumatoid arthritis.") }
        if a.comorbidities.osteoarthritis { fire("S-062", "Osteoarthritis documented.") }
        if a.comorbidities.thyroidDisorder { fire("S-063", "Thyroid disorder.") }

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

        let chronicity: Int = {
            switch a.shoulderPain.painDuration {
            case let s where s.contains("Acute"): return 3
            case let s where s.contains("Subacute"): return 8
            case let s where s.contains("Chronic"): return 16
            default: return 6
            }
        }()

        return PredictionResult(
            createdAt: .now,
            region: .shoulder,
            score: score,
            band: band,
            firedRules: fired,
            chronicityWeeks: chronicity,
            predictedCall: call,
            condition: .shoulder
        )
    }
}
