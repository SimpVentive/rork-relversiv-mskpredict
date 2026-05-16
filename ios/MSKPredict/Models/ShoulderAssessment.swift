//
//  ShoulderAssessment.swift
//  MSKPredict
//
//  Data model mirroring the locked Shoulder Pain Assessment JSONB schema.
//

import Foundation

struct ShoulderAssessment: Codable, Hashable {
    var demographics = Demographics()
    var shoulderPain = ShoulderPain()
    var rom = ROM()
    var physioExam = PhysioExam()
    var comorbidities = Comorbidities()
    var lifestyle = Lifestyle()
    var clinical = Clinical()
    var investigations = Investigations()

    // MARK: Demographics (same shape as back)
    struct Demographics: Codable, Hashable {
        var age: Int = 50
        var gender: String = "Female"
        var heightCm: Int = 165
        var weightKg: Int = 68
        var waistCm: Int = 84
        var hipCm: Int = 96
        var bmi: Double {
            let h = Double(heightCm) / 100
            guard h > 0 else { return 0 }
            return Double(weightKg) / (h * h)
        }
    }

    // MARK: Shoulder pain profile
    struct ShoulderPain: Codable, Hashable {
        var painIntensity: Int = 5                  // 0-10
        var painOnset: String = "Insidious"
        var painDuration: String = "Subacute (6-12w)"
        var painLocation: String = "Lateral"        // Anterior/Lateral/Posterior/Superior/Bilateral
        var painRadiation: Bool = false
        var painRadiationLocation: String = ""
        var painFrequency: String = "Intermittent"
        var painWorseWith: String = ""
        var painBetterWith: String = ""
        var nightPain: Bool = false
        var functionalLimitation: Int = 4            // 0-10
    }

    // MARK: ROM (shoulder-specific 6 movements)
    struct ROM: Codable, Hashable {
        var flexion = ROMComponent(angleDegrees: 150, scale: 1)
        var abduction = ROMComponent(angleDegrees: 130, scale: 1)
        var externalRotationAtSide = ROMComponent(angleDegrees: 60, scale: 1)
        var internalRotationAtSide = ROMComponent(angleDegrees: 50, scale: 1)
        var externalRotation90Abducted = ROMComponent(angleDegrees: 75, scale: 1)
        var horizontalAdduction = ROMComponent(angleDegrees: 80, scale: 0)
        var measurementTool: String = "Goniometer"
        var notes: String = ""
    }

    // MARK: Physio exam
    struct PhysioExam: Codable, Hashable {
        var impingementTest = GradedFinding()
        var hawkinsKennedy = GradedFinding()
        var obrien = GradedFinding()
        var dropArm = GradedFinding()

        // Manual muscle test 0-5
        var supraspinatusStrength: Int = 5
        var infraspinatusStrength: Int = 5
        var subscapularisStrength: Int = 5

        var muscleTenderness = GradedFinding(graded: .zero, location: "Supraspinatus")
        var muscleTightness = GradedFinding(graded: .zero, location: "Pectoralis major")
        var muscleSpasm = GradedFinding()

        // Postural
        var forwardHeadPosture = false
        var roundedShoulders = false
        var scapularWinging = false
        var posturalAsymmetry: String = ""

        // Neurological
        var sensationIntact = true
        var strengthNormal = true

        var examNotes: String = ""
    }

    // MARK: Comorbidities
    struct Comorbidities: Codable, Hashable {
        var hypertension = false
        var diabetes = false
        var osteoarthritis = false
        var osteoporosis = false
        var previousShoulderInjury = false
        var previousShoulderSurgery = false
        var thyroidDisorder = false
        var rheumatoidArthritis = false
        var mentalHealthDisorder = false
        var notes: String = ""
    }

    // MARK: Lifestyle (shoulder-specific)
    struct Lifestyle: Codable, Hashable {
        var smokingStatus: String = "Non-smoker"
        var cigarettesPerDay: Int = 0
        var packYears: Double = 0

        var alcoholStatus: String = "Occasional"
        var drinksPerWeek: Int = 0

        var overheadWorkHoursPerDay: Int = 0
        var liftingFrequency: String = "Occasional"   // Never/Rare/Occasional/Frequent/Constant
        var liftingWeightKg: Int = 0
        var repetitiveArmMotion: Bool = false
        var throwingActivities: Bool = false
        var keyboardUseHoursPerDay: Int = 4

        // Ergonomics
        var deskHeightAppropriate: Bool = true
        var chairArmrestHeight: String = "Appropriate" // Too low / Appropriate / Too high
        var keyboardPositionAppropriate: Bool = true
        var mousePositionAppropriate: Bool = true
        var monitorHeightAppropriate: Bool = true
        var frequentPostureChanges: Bool = true

        var exerciseFrequency: String = "2-3x/week"
        var exerciseType: String = ""
        var shoulderSpecificExercise: Bool = false
        var exerciseDurationMinutes: Int = 30

        var sleepHoursPerNight: Int = 7
        var sleepQuality: String = "Good"
        var sleepPosition: String = "Side"
        var shoulderPainAffectsSleep: Bool = false

        var jobStressLevel: Int = 4
        var lifeStressLevel: Int = 4

        var sportsParticipation: Bool = false
        var sportType: String = ""
        var sportFrequency: String = "Occasional"
    }

    // MARK: Clinical
    struct Clinical: Codable, Hashable {
        var chiefComplaint: String = ""
        var shoulderAffected: String = "Right"        // Left / Right / Bilateral
        var disabilityLevel: String = "Mild"

        var clickingClunking: Bool = false
        var catchingSensation: Bool = false
        var instabilityFeeling: Bool = false
        var muscleWeakness: Bool = false
        var numbnessTingling: Bool = false

        var clinicianDiagnosis: String = ""
        var suspectedPathology: String = ""
        var clinicianNotes: String = ""
    }

    // MARK: Investigations
    struct Investigations: Codable, Hashable {
        var xrayDone = false
        var xrayFindings: String = ""
        var mriDone = false
        var mriFindings: String = ""
        var mriRotatorCuffFindings: String = ""        // e.g. Supraspinatus tear, Partial tear, Tendinopathy
        var mriLabralFindings: String = ""             // e.g. SLAP, Bankart
        var ultrasoundDone = false
        var ultrasoundFindings: String = ""
        var esrValue: Double = 0
        var crpValue: Double = 0
        var notes: String = ""
    }
}
