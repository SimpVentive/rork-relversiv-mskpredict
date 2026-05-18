//
//  RulesEngine.swift
//  MSKPredict
//
//  A small explainable rules engine for musculoskeletal (MSK) pain
//  prognosis. Each rule contributes a weighted score with a human-readable
//  rationale, so clinicians see WHY a prediction was made.
//

import Foundation
import SwiftUI

// MARK: - Patient input

struct PatientInput {
    var age: Double = 45
    var painScore: Double = 6      // 0-10 NRS
    var painDurationWeeks: Double = 6
    var bmi: Double = 27
    var region: PainRegion = .lowerBack
    var radiatingPain: Bool = false
    var redFlagSymptoms: Bool = false
    var priorEpisodes: Bool = false
    var psychosocialDistress: Bool = false
    var sedentary: Bool = false
    var smoker: Bool = false
}

enum PainRegion: String, CaseIterable, Identifiable {
    case neck = "Neck"
    case shoulder = "Shoulder"
    case lowerBack = "Lower Back"
    case hip = "Hip"
    case knee = "Knee"

    var id: String { rawValue }
    var icon: String {
        switch self {
        case .neck: return "figure.stand"
        case .shoulder: return "figure.arms.open"
        case .lowerBack: return "figure.walk"
        case .hip: return "figure.walk.motion"
        case .knee: return "figure.run"
        }
    }
}

// MARK: - Rule

struct ClinicalRule: Identifiable, Hashable {
    let id: String
    let name: String
    let category: Category
    let description: String
    let weight: Int           // positive = increases risk

    enum Category: String, CaseIterable {
        case redFlag = "Red Flag"
        case demographic = "Demographic"
        case clinical = "Clinical"
        case lifestyle = "Lifestyle"
        case psychosocial = "Psychosocial"

        var color: Color {
            switch self {
            case .redFlag: return Brand.danger
            case .demographic: return .indigo
            case .clinical: return Brand.navyMid
            case .lifestyle: return Brand.warning
            case .psychosocial: return .purple
            }
        }

        var icon: String {
            switch self {
            case .redFlag: return "exclamationmark.octagon.fill"
            case .demographic: return "person.crop.circle.fill"
            case .clinical: return "waveform.path.ecg"
            case .lifestyle: return "leaf.fill"
            case .psychosocial: return "brain.head.profile"
            }
        }
    }
}

struct FiredRule: Identifiable {
    let rule: ClinicalRule
    let evidence: String
    var id: String { rule.id }
}

// MARK: - Result

enum RiskBand: String {
    case low = "Low"
    case moderate = "Moderate"
    case high = "High"
    case veryHigh = "Very High"

    var color: Color {
        switch self {
        case .low: return Brand.success
        case .moderate: return Brand.accent
        case .high: return Brand.warning
        case .veryHigh: return Brand.danger
        }
    }

    var summary: String {
        switch self {
        case .low: return "Likely self-resolving. Reassure & advise activity."
        case .moderate: return "Targeted physiotherapy. Reassess in 4 weeks."
        case .high: return "Multimodal care. Consider imaging if persistent."
        case .veryHigh: return "Specialist referral and red-flag workup advised."
        }
    }
}

struct PredictionResult: Identifiable, Hashable {
    static func == (lhs: PredictionResult, rhs: PredictionResult) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id = UUID()
    let createdAt: Date
    let region: PainRegion
    let score: Int        // 0 - 100
    let band: RiskBand
    let firedRules: [FiredRule]
    let chronicityWeeks: Int
    var predictedCall: ClinicianCall = .green
    var condition: ConditionType = .back
    var clinicianCall: ClinicianCall? = nil   // ground truth, set by clinician later
}

// MARK: - Engine

enum RulesEngine {
    static let allRules: [ClinicalRule] = [
        .init(id: "R-001", name: "Red Flag Symptoms",
              category: .redFlag,
              description: "Saddle anesthesia, bowel/bladder dysfunction, unexplained weight loss, or night pain.",
              weight: 35),
        .init(id: "R-002", name: "High Pain Intensity",
              category: .clinical,
              description: "Reported NRS pain score ≥ 7.",
              weight: 12),
        .init(id: "R-003", name: "Radiating Pain",
              category: .clinical,
              description: "Pain radiating below the knee suggests radiculopathy.",
              weight: 14),
        .init(id: "R-004", name: "Chronic Duration",
              category: .clinical,
              description: "Symptom duration > 12 weeks.",
              weight: 16),
        .init(id: "R-005", name: "Prior Episodes",
              category: .clinical,
              description: "History of recurrent MSK pain episodes.",
              weight: 8),
        .init(id: "R-006", name: "Elevated BMI",
              category: .lifestyle,
              description: "BMI ≥ 30 increases mechanical load on joints.",
              weight: 7),
        .init(id: "R-007", name: "Sedentary Lifestyle",
              category: .lifestyle,
              description: "Less than 150 min/wk moderate activity.",
              weight: 6),
        .init(id: "R-008", name: "Active Smoker",
              category: .lifestyle,
              description: "Smoking impairs tissue healing.",
              weight: 5),
        .init(id: "R-009", name: "Psychosocial Distress",
              category: .psychosocial,
              description: "Anxiety, depression, or fear-avoidance behaviors present.",
              weight: 11),
        .init(id: "R-010", name: "Older Adult",
              category: .demographic,
              description: "Age ≥ 60 with degenerative risk.",
              weight: 6)
    ]

    static func evaluate(_ input: PatientInput) -> PredictionResult {
        var fired: [FiredRule] = []

        func fire(_ id: String, evidence: String) {
            if let r = allRules.first(where: { $0.id == id }) {
                fired.append(.init(rule: r, evidence: evidence))
            }
        }

        if input.redFlagSymptoms {
            fire("R-001", evidence: "Patient reports red-flag symptoms.")
        }
        if input.painScore >= 7 {
            fire("R-002", evidence: "Pain NRS = \(Int(input.painScore))/10.")
        }
        if input.radiatingPain {
            fire("R-003", evidence: "Radicular pattern reported.")
        }
        if input.painDurationWeeks > 12 {
            fire("R-004", evidence: "Symptoms for \(Int(input.painDurationWeeks)) weeks.")
        }
        if input.priorEpisodes {
            fire("R-005", evidence: "Recurrent episodes documented.")
        }
        if input.bmi >= 30 {
            fire("R-006", evidence: "BMI = \(String(format: "%.1f", input.bmi)).")
        }
        if input.sedentary {
            fire("R-007", evidence: "Sedentary activity profile.")
        }
        if input.smoker {
            fire("R-008", evidence: "Current smoker.")
        }
        if input.psychosocialDistress {
            fire("R-009", evidence: "Distress screener positive.")
        }
        if input.age >= 60 {
            fire("R-010", evidence: "Age = \(Int(input.age)).")
        }

        let raw = fired.map(\.rule.weight).reduce(0, +)
        let score = min(100, raw)
        let band: RiskBand
        switch score {
        case 0..<20: band = .low
        case 20..<45: band = .moderate
        case 45..<70: band = .high
        default: band = .veryHigh
        }

        let call: ClinicianCall = {
            switch band {
            case .low: return .green
            case .moderate: return .amber
            case .high, .veryHigh: return .red
            }
        }()
        let cond: ConditionType = {
            switch input.region {
            case .shoulder: return .shoulder
            case .knee, .hip: return .knee
            default: return .back
            }
        }()
        return PredictionResult(
            createdAt: .now,
            region: input.region,
            score: score,
            band: band,
            firedRules: fired,
            chronicityWeeks: Int(input.painDurationWeeks),
            predictedCall: call,
            condition: cond
        )
    }
}
