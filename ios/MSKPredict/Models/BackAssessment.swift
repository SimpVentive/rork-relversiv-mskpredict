//
//  BackAssessment.swift
//  MSKPredict
//
//  Data model mirroring the locked Back Pain Assessment JSONB schema.
//

import Foundation

// MARK: - Condition + Clinician Ground Truth

enum ConditionType: String, CaseIterable, Identifiable, Codable {
    case back = "back"
    case shoulder = "shoulder"
    case knee = "knee"

    var id: String { rawValue }
    var title: String {
        switch self {
        case .back: return "Back"
        case .shoulder: return "Shoulder"
        case .knee: return "Knee"
        }
    }
    var icon: String {
        switch self {
        case .back: return "figure.walk"
        case .shoulder: return "figure.arms.open"
        case .knee: return "figure.run"
        }
    }
}

enum ClinicianCall: String, CaseIterable, Identifiable, Codable {
    case red = "Red"
    case amber = "Amber"
    case green = "Green"

    var id: String { rawValue }
    var description: String {
        switch self {
        case .red: return "High risk — urgent action"
        case .amber: return "Moderate risk — monitor"
        case .green: return "Low risk — routine care"
        }
    }
}

// MARK: - Sub structures

struct ROMComponent: Codable, Hashable {
    var angleDegrees: Double = 0
    var scale: Int = 0   // 0-3
}

enum GradedScore: Int, CaseIterable, Identifiable, Codable {
    case zero = 0, three = 3, five = 5
    var id: Int { rawValue }
    var label: String {
        switch self {
        case .zero: return "0 · Normal"
        case .three: return "3 · Mild"
        case .five: return "5 · Marked"
        }
    }
}

struct GradedFinding: Codable, Hashable {
    var graded: GradedScore = .zero
    var location: String = ""
}

// MARK: - Back Assessment root

struct BackAssessment: Codable, Hashable {
    var demographics = Demographics()
    var startBack = StartBack()
    var rom = ROM()
    var comorbidities = Comorbidities()
    var physioExam = PhysioExam()
    var lifestyle = Lifestyle()
    var clinical = Clinical()
    var investigations = Investigations()

    // MARK: Demographics
    struct Demographics: Codable, Hashable {
        var age: Int = 45
        var gender: String = "Male"
        var heightCm: Int = 170
        var weightKg: Int = 72
        var waistCm: Int = 86
        var hipCm: Int = 96
        var bmi: Double {
            let h = Double(heightCm) / 100
            guard h > 0 else { return 0 }
            return Double(weightKg) / (h * h)
        }
    }

    // MARK: STarT Back
    struct StartBack: Codable, Hashable {
        var rawScore: Int = 3   // 0-9
        var toolVersion: String = "1.062"
        var riskCategory: String {
            switch rawScore {
            case 0...3: return "Low"
            case 4: return "Moderate"
            default: return "High"
            }
        }
    }

    // MARK: ROM
    struct ROM: Codable, Hashable {
        var flexion = ROMComponent(angleDegrees: 90, scale: 1)
        var extension_ = ROMComponent(angleDegrees: 25, scale: 1)
        var leftRotation = ROMComponent(angleDegrees: 35, scale: 1)
        var rightRotation = ROMComponent(angleDegrees: 35, scale: 1)
        var lateralFlexionLeft: Double = 25
        var lateralFlexionRight: Double = 25
        var measurementTool: String = "Inclinometer"
        var notes: String = ""

        enum CodingKeys: String, CodingKey {
            case flexion, extension_ = "extension", leftRotation = "left_rotation"
            case rightRotation = "right_rotation"
            case lateralFlexionLeft = "lateral_flexion_left_degrees"
            case lateralFlexionRight = "lateral_flexion_right_degrees"
            case measurementTool = "measurement_tool", notes
        }
    }

    // MARK: Comorbidities
    struct Comorbidities: Codable, Hashable {
        var hypertension = false
        var hypertensionYears: Int = 0
        var diabetes = false
        var diabetesType: String = "Type 2"
        var osteoarthritis = false
        var osteoarthritisSeverity: String = "Mild"
        var osteoporosis = false
        var previousBackInjury = false
        var previousBackSurgery = false
        var thyroidDisorder = false
        var rheumatoidArthritis = false
        var asthma = false
        var copd = false
        var cardiovascularDisease = false
        var kidneyDisease = false
        var liverDisease = false
        var cancer = false
        var mentalHealthDisorder = false
        var notes: String = ""
    }

    // MARK: Physio Exam
    struct PhysioExam: Codable, Hashable {
        var slrLeft = GradedFinding()
        var slrRight = GradedFinding()
        var faberLeft = GradedFinding()
        var faberRight = GradedFinding()
        var fair = GradedFinding()
        var hyperextension = GradedFinding()

        var muscleTenderness = GradedFinding(graded: .zero, location: "L5")
        var muscleTightness = GradedFinding(graded: .zero, location: "Bilateral")
        var muscleKnots = GradedFinding()
        var muscleSpasm = GradedFinding()

        // Postural
        var forwardHeadPosture = false
        var increasedThoracicKyphosis = false
        var lossOfLumbarLordosis = false
        var scoliosis = false

        // Neurological
        var sensationIntact = true
        var strengthNormal = true
        var reflexesNormal = true

        // Spine palpation
        var spinousProcessTenderness = false
        var facetJointTenderness = false
        var sacroiliacJointTenderness = false

        // Movement
        var painfulArcPresent = false
        var painWithMovement: String = ""

        var examNotes: String = ""
    }

    // MARK: Lifestyle
    struct Lifestyle: Codable, Hashable {
        var smokingStatus: String = "Non-smoker"          // Non-smoker / Occasional / Regular / Heavy
        var cigarettesPerDay: Int = 0
        var packYears: Double = 0

        var alcoholStatus: String = "Occasional"          // Teetotaler / Occasional / Regular
        var drinksPerWeek: Int = 0

        var standing5Plus = false
        var sitting5Plus = false
        var standingHoursPerDay: Int = 4
        var sittingHoursPerDay: Int = 4

        var deskErgonomics: String = "Good"               // Poor / Fair / Good / Excellent
        var frequentPostureChanges = true

        var exerciseFrequency: String = "2-3x/week"       // Never / Rare / 1x/week / 2-3x/week / Daily
        var exerciseDurationMinutes: Int = 30

        var sleepHoursPerNight: Int = 7
        var sleepQuality: String = "Good"                 // Poor / Fair / Good / Excellent

        var jobStressLevel: Int = 4    // 0-10
        var lifeStressLevel: Int = 4   // 0-10

        var heavyLiftingFrequency: String = "Occasional"  // Never / Rare / Occasional / Frequent
        var properLiftingTechnique = true
    }

    // MARK: Clinical
    struct Clinical: Codable, Hashable {
        var chiefComplaint: String = ""
        var painOnset: String = "Insidious"               // Acute / Insidious / Gradual / Sudden
        var painDuration: String = "Subacute (6-12w)"     // Acute (<6w) / Subacute (6-12w) / Chronic (>3m)
        var painLocation: String = "L5"
        var painRadiation: Bool = false
        var painRadiationLocation: String = ""

        var painIntensity: Int = 5                        // 0-10 VAS
        var painFrequency: String = "Intermittent"        // Constant / Intermittent / Occasional / Rare
        var painWorseWith: String = ""
        var painBetterWith: String = ""

        var nightPain: Bool = false
        var morningStiffness: Bool = false
        var morningStiffnessMinutes: Int = 0

        var disabilityLevel: String = "Mild"              // Minimal / Mild / Moderate / Severe / Disabling

        var clinicianDiagnosis: String = ""
        var clinicianNotes: String = ""
    }

    // MARK: Investigations
    struct Investigations: Codable, Hashable {
        var xrayDone = false
        var mriDone = false
        var mriDiscHerniationLevel: String = ""           // e.g. L4/L5
        var mriDiscHerniationSeverity: String = ""        // Bulge / Protrusion / Extrusion
        var ctDone = false
        var ultrasoundDone = false
        var esrValue: Double = 0
        var crpValue: Double = 0
        var notes: String = ""
    }
}
