//
//  ShoulderAssessmentView.swift
//  MSKPredict
//
//  Full sectioned form covering the locked Shoulder Pain Assessment schema.
//

import SwiftUI

struct ShoulderAssessmentInline: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(PredictionStore.self) private var store

    @State private var a = ShoulderAssessment()
    @State private var clinicianCall: ClinicianCall? = nil
    @State private var isAnalyzing = false
    @State private var result: PredictionResult?
    @State private var step: Int = 0

    private let sections = [
        "Demographics", "Shoulder Pain", "ROM", "Physio Exam",
        "Comorbidities", "Lifestyle", "Clinical", "Investigations", "Clinician Call"
    ]

    var body: some View {
        VStack(spacing: 0) {
            progressBar
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    sectionHeader
                    Group {
                        switch step {
                        case 0: demographicsSection
                        case 1: painSection
                        case 2: romSection
                        case 3: physioExamSection
                        case 4: comorbiditiesSection
                        case 5: lifestyleSection
                        case 6: clinicalSection
                        case 7: investigationsSection
                        default: clinicianCallSection
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .padding(.bottom, 100)
            }
            footer
        }
        .background(Brand.surface)
        .navigationTitle("Shoulder Assessment")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Text("\(step + 1)/\(sections.count)")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(Brand.textSecondary)
            }
        }
        .navigationDestination(item: $result) { r in
            PredictionDetailView(result: r)
        }
    }

    // MARK: - Chrome

    private var progressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Rectangle().fill(Brand.hairline)
                Rectangle()
                    .fill(Brand.heroGradient)
                    .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(sections.count))
                    .animation(.snappy, value: step)
            }
        }
        .frame(height: 3)
    }

    private var sectionHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("STEP \(step + 1)")
                .tracking(1.5)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Brand.accent)
            Text(sections[step])
                .font(.system(size: 26, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.textPrimary)
        }
    }

    private var footer: some View {
        HStack(spacing: 10) {
            if step > 0 {
                Button {
                    withAnimation(.snappy) { step -= 1 }
                } label: {
                    Label("Back", systemImage: "chevron.left")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .foregroundStyle(Brand.textPrimary)
                        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Brand.hairline, lineWidth: 1))
                }
                .buttonStyle(PressableButtonStyle())
            }

            Button {
                if step < sections.count - 1 {
                    withAnimation(.snappy) { step += 1 }
                } else {
                    run()
                }
            } label: {
                HStack(spacing: 8) {
                    if isAnalyzing {
                        ProgressView().tint(.white)
                        Text("Analyzing…")
                    } else if step < sections.count - 1 {
                        Text("Continue")
                        Image(systemName: "chevron.right")
                    } else {
                        Image(systemName: "sparkles")
                        Text("Run prediction")
                    }
                }
                .font(.system(size: 15, weight: .semibold))
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .foregroundStyle(.white)
                .background(Brand.heroGradient, in: .rect(cornerRadius: 14))
                .shadow(color: Brand.navy.opacity(0.3), radius: 10, x: 0, y: 6)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(isAnalyzing)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
    }

    // MARK: - Sections

    private var demographicsSection: some View {
        card {
            stepper("Age", value: $a.demographics.age, range: 18...95, unit: "yrs")
            picker("Gender", selection: $a.demographics.gender, options: ["Male", "Female", "Other"])
            stepper("Height", value: $a.demographics.heightCm, range: 130...210, unit: "cm")
            stepper("Weight", value: $a.demographics.weightKg, range: 35...180, unit: "kg")
            stepper("Waist", value: $a.demographics.waistCm, range: 50...160, unit: "cm")
            stepper("Hip", value: $a.demographics.hipCm, range: 60...160, unit: "cm")
            HStack {
                Label("BMI", systemImage: "scalemass.fill")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                Text(String(format: "%.1f kg/m²", a.demographics.bmi))
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(Brand.navyMid)
            }
            .padding(.top, 4)
        }
    }

    private var painSection: some View {
        VStack(spacing: 14) {
            card {
                slider(title: "Pain (VAS)", value: Binding(
                    get: { Double(a.shoulderPain.painIntensity) },
                    set: { a.shoulderPain.painIntensity = Int($0) }
                ), range: 0...10, unit: "/10", precision: 0)
                slider(title: "Functional limitation", value: Binding(
                    get: { Double(a.shoulderPain.functionalLimitation) },
                    set: { a.shoulderPain.functionalLimitation = Int($0) }
                ), range: 0...10, unit: "/10", precision: 0)
            }
            card {
                picker("Onset", selection: $a.shoulderPain.painOnset, options: ["Acute", "Insidious", "Gradual", "Sudden"])
                picker("Duration", selection: $a.shoulderPain.painDuration, options: ["Acute (<6w)", "Subacute (6-12w)", "Chronic (>3m)"])
                picker("Location", selection: $a.shoulderPain.painLocation, options: ["Anterior", "Lateral", "Posterior", "Superior", "Bilateral"])
                picker("Frequency", selection: $a.shoulderPain.painFrequency, options: ["Constant", "Intermittent", "Occasional", "Rare"])
            }
            card {
                toggleRow("Pain radiation", icon: "bolt.fill", isOn: $a.shoulderPain.painRadiation)
                if a.shoulderPain.painRadiation {
                    textField("Radiation location", text: $a.shoulderPain.painRadiationLocation)
                }
                textField("Worse with", text: $a.shoulderPain.painWorseWith)
                textField("Better with", text: $a.shoulderPain.painBetterWith)
                toggleRow("Night pain", icon: "moon.fill", isOn: $a.shoulderPain.nightPain, tint: Brand.danger)
            }
        }
    }

    private var romSection: some View {
        VStack(spacing: 14) {
            romCard("Flexion", comp: $a.rom.flexion, max: 180)
            romCard("Abduction", comp: $a.rom.abduction, max: 180)
            romCard("External rotation (arm at side)", comp: $a.rom.externalRotationAtSide, max: 90)
            romCard("Internal rotation (arm at side)", comp: $a.rom.internalRotationAtSide, max: 90)
            romCard("External rotation (90° abducted)", comp: $a.rom.externalRotation90Abducted, max: 110)
            romCard("Horizontal adduction", comp: $a.rom.horizontalAdduction, max: 130)
            card {
                picker("Measurement tool", selection: $a.rom.measurementTool, options: ["Goniometer", "Inclinometer", "Visual"])
                textField("Notes", text: $a.rom.notes)
            }
        }
    }

    private func romCard(_ title: String, comp: Binding<ROMComponent>, max: Double) -> some View {
        card {
            Text(title).font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
            slider(title: "Angle", value: comp.angleDegrees, range: 0...max, unit: "°", precision: 0)
            scaleRow("Scale", value: comp.scale)
        }
    }

    private var physioExamSection: some View {
        VStack(spacing: 14) {
            card {
                Text("Special tests (graded 0 / 3 / 5)")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                gradedRow("Impingement (Neer)", finding: $a.physioExam.impingementTest)
                gradedRow("Hawkins-Kennedy", finding: $a.physioExam.hawkinsKennedy)
                gradedRow("O'Brien (active compression)", finding: $a.physioExam.obrien)
                gradedRow("Drop arm", finding: $a.physioExam.dropArm)
            }
            card {
                Text("Rotator cuff strength (0–5 MMT)")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                mmtRow("Supraspinatus", value: $a.physioExam.supraspinatusStrength)
                mmtRow("Infraspinatus", value: $a.physioExam.infraspinatusStrength)
                mmtRow("Subscapularis", value: $a.physioExam.subscapularisStrength)
            }
            card {
                Text("Palpation & tenderness")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                gradedRow("Muscle tenderness", finding: $a.physioExam.muscleTenderness, showLocation: true)
                gradedRow("Muscle tightness", finding: $a.physioExam.muscleTightness, showLocation: true)
                gradedRow("Muscle spasm", finding: $a.physioExam.muscleSpasm)
            }
            card {
                Text("Postural").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                toggleRow("Forward head posture", icon: "person.fill", isOn: $a.physioExam.forwardHeadPosture)
                toggleRow("Rounded shoulders", icon: "arrow.down.right", isOn: $a.physioExam.roundedShoulders)
                toggleRow("Scapular winging", icon: "triangle", isOn: $a.physioExam.scapularWinging)
                textField("Asymmetry notes", text: $a.physioExam.posturalAsymmetry)
            }
            card {
                Text("Neurological").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                toggleRow("Sensation intact", icon: "hand.tap.fill", isOn: $a.physioExam.sensationIntact, tint: Brand.success)
                toggleRow("Strength normal", icon: "dumbbell.fill", isOn: $a.physioExam.strengthNormal, tint: Brand.success)
            }
            card { textField("Exam notes", text: $a.physioExam.examNotes) }
        }
    }

    private var comorbiditiesSection: some View {
        VStack(spacing: 14) {
            card {
                toggleRow("Hypertension", icon: "heart.fill", isOn: $a.comorbidities.hypertension)
                toggleRow("Diabetes", icon: "drop.fill", isOn: $a.comorbidities.diabetes)
                toggleRow("Osteoarthritis", icon: "figure.walk", isOn: $a.comorbidities.osteoarthritis)
                toggleRow("Osteoporosis", icon: "circle.dotted", isOn: $a.comorbidities.osteoporosis)
                toggleRow("Previous shoulder injury", icon: "bandage.fill", isOn: $a.comorbidities.previousShoulderInjury)
                toggleRow("Previous shoulder surgery", icon: "cross.case.fill", isOn: $a.comorbidities.previousShoulderSurgery)
            }
            card {
                toggleRow("Thyroid disorder", icon: "circle.grid.cross", isOn: $a.comorbidities.thyroidDisorder)
                toggleRow("Rheumatoid arthritis", icon: "hand.raised.fill", isOn: $a.comorbidities.rheumatoidArthritis)
                toggleRow("Mental health disorder", icon: "brain.head.profile", isOn: $a.comorbidities.mentalHealthDisorder)
            }
            card { textField("Notes", text: $a.comorbidities.notes) }
        }
    }

    private var lifestyleSection: some View {
        VStack(spacing: 14) {
            card {
                Text("Smoking").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                picker("Status", selection: $a.lifestyle.smokingStatus, options: ["Non-smoker", "Occasional", "Regular", "Heavy"])
                if a.lifestyle.smokingStatus != "Non-smoker" {
                    stepper("Cigarettes/day", value: $a.lifestyle.cigarettesPerDay, range: 0...60, unit: "")
                }
            }
            card {
                Text("Alcohol").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                picker("Status", selection: $a.lifestyle.alcoholStatus, options: ["Teetotaler", "Occasional", "Regular"])
                stepper("Drinks/week", value: $a.lifestyle.drinksPerWeek, range: 0...50, unit: "")
            }
            card {
                Text("Work exposure").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                stepper("Overhead work", value: $a.lifestyle.overheadWorkHoursPerDay, range: 0...12, unit: "h/day")
                picker("Lifting frequency", selection: $a.lifestyle.liftingFrequency, options: ["Never", "Rare", "Occasional", "Frequent", "Constant"])
                stepper("Lifting weight", value: $a.lifestyle.liftingWeightKg, range: 0...80, unit: "kg")
                toggleRow("Repetitive arm motion", icon: "arrow.triangle.2.circlepath", isOn: $a.lifestyle.repetitiveArmMotion)
                toggleRow("Throwing activities", icon: "figure.baseball", isOn: $a.lifestyle.throwingActivities)
                stepper("Keyboard use", value: $a.lifestyle.keyboardUseHoursPerDay, range: 0...16, unit: "h/day")
            }
            card {
                Text("Ergonomics").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                toggleRow("Desk height appropriate", icon: "table.furniture", isOn: $a.lifestyle.deskHeightAppropriate, tint: Brand.success)
                picker("Chair armrest height", selection: $a.lifestyle.chairArmrestHeight, options: ["Too low", "Appropriate", "Too high"])
                toggleRow("Keyboard appropriate", icon: "keyboard", isOn: $a.lifestyle.keyboardPositionAppropriate, tint: Brand.success)
                toggleRow("Mouse appropriate", icon: "computermouse", isOn: $a.lifestyle.mousePositionAppropriate, tint: Brand.success)
                toggleRow("Monitor appropriate", icon: "display", isOn: $a.lifestyle.monitorHeightAppropriate, tint: Brand.success)
                toggleRow("Frequent posture changes", icon: "arrow.triangle.2.circlepath", isOn: $a.lifestyle.frequentPostureChanges)
            }
            card {
                picker("Exercise", selection: $a.lifestyle.exerciseFrequency, options: ["Never", "Rare", "1x/week", "2-3x/week", "Daily"])
                textField("Exercise type", text: $a.lifestyle.exerciseType)
                toggleRow("Shoulder-specific exercise", icon: "figure.strengthtraining.traditional", isOn: $a.lifestyle.shoulderSpecificExercise)
                stepper("Duration", value: $a.lifestyle.exerciseDurationMinutes, range: 0...180, unit: "min")
            }
            card {
                stepper("Sleep", value: $a.lifestyle.sleepHoursPerNight, range: 0...12, unit: "h")
                picker("Sleep quality", selection: $a.lifestyle.sleepQuality, options: ["Poor", "Fair", "Good", "Excellent"])
                picker("Sleep position", selection: $a.lifestyle.sleepPosition, options: ["Back", "Side", "Stomach", "Variable"])
                toggleRow("Shoulder pain affects sleep", icon: "bed.double.fill", isOn: $a.lifestyle.shoulderPainAffectsSleep, tint: Brand.danger)
            }
            card {
                slider(title: "Job stress", value: Binding(
                    get: { Double(a.lifestyle.jobStressLevel) },
                    set: { a.lifestyle.jobStressLevel = Int($0) }
                ), range: 0...10, unit: "/10", precision: 0)
                slider(title: "Life stress", value: Binding(
                    get: { Double(a.lifestyle.lifeStressLevel) },
                    set: { a.lifestyle.lifeStressLevel = Int($0) }
                ), range: 0...10, unit: "/10", precision: 0)
            }
            card {
                toggleRow("Sports participation", icon: "sportscourt", isOn: $a.lifestyle.sportsParticipation)
                if a.lifestyle.sportsParticipation {
                    textField("Sport type", text: $a.lifestyle.sportType)
                    picker("Frequency", selection: $a.lifestyle.sportFrequency, options: ["Occasional", "Weekly", "2-3x weekly"])
                }
            }
        }
    }

    private var clinicalSection: some View {
        VStack(spacing: 14) {
            card {
                textField("Chief complaint", text: $a.clinical.chiefComplaint)
                picker("Shoulder affected", selection: $a.clinical.shoulderAffected, options: ["Left", "Right", "Bilateral"])
                picker("Disability", selection: $a.clinical.disabilityLevel, options: ["Minimal", "Mild", "Moderate", "Severe", "Disabling"])
            }
            card {
                Text("Associated symptoms").font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.textPrimary)
                toggleRow("Clicking / clunking", icon: "speaker.wave.2.fill", isOn: $a.clinical.clickingClunking)
                toggleRow("Catching sensation", icon: "hand.point.up.left.fill", isOn: $a.clinical.catchingSensation)
                toggleRow("Instability feeling", icon: "arrow.left.and.right", isOn: $a.clinical.instabilityFeeling)
                toggleRow("Muscle weakness", icon: "figure.strengthtraining.functional", isOn: $a.clinical.muscleWeakness)
                toggleRow("Numbness / tingling", icon: "waveform.path", isOn: $a.clinical.numbnessTingling)
            }
            card {
                textField("Clinician diagnosis", text: $a.clinical.clinicianDiagnosis)
                textField("Suspected pathology", text: $a.clinical.suspectedPathology)
                textField("Clinician notes", text: $a.clinical.clinicianNotes)
            }
        }
    }

    private var investigationsSection: some View {
        VStack(spacing: 14) {
            card {
                Text("Optional").font(.system(size: 11, weight: .semibold))
                    .tracking(1.5).foregroundStyle(Brand.accent)
                toggleRow("X-ray done", icon: "doc.viewfinder", isOn: $a.investigations.xrayDone)
                if a.investigations.xrayDone {
                    textField("X-ray findings", text: $a.investigations.xrayFindings)
                }
                toggleRow("MRI done", icon: "waveform", isOn: $a.investigations.mriDone)
                if a.investigations.mriDone {
                    textField("MRI findings", text: $a.investigations.mriFindings)
                    textField("Rotator cuff findings", text: $a.investigations.mriRotatorCuffFindings)
                    textField("Labral findings (optional)", text: $a.investigations.mriLabralFindings)
                }
                toggleRow("Ultrasound done", icon: "dot.radiowaves.left.and.right", isOn: $a.investigations.ultrasoundDone)
                if a.investigations.ultrasoundDone {
                    textField("Ultrasound findings", text: $a.investigations.ultrasoundFindings)
                }
            }
            card {
                slider(title: "ESR", value: $a.investigations.esrValue, range: 0...100, unit: "mm/h", precision: 0)
                slider(title: "CRP", value: $a.investigations.crpValue, range: 0...100, unit: "mg/L", precision: 0)
                textField("Notes", text: $a.investigations.notes)
            }
        }
    }

    private var clinicianCallSection: some View {
        VStack(spacing: 14) {
            card {
                Text("Optional ground truth")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.5).foregroundStyle(Brand.accent)
                Text("Record the clinician's own Red / Amber / Green call to validate the rules engine over time.")
                    .font(.system(size: 12.5))
                    .foregroundStyle(Brand.textSecondary)
                VStack(spacing: 10) {
                    ForEach(ClinicianCall.allCases) { call in
                        Button {
                            withAnimation(.snappy) {
                                clinicianCall = clinicianCall == call ? nil : call
                            }
                        } label: {
                            HStack(spacing: 12) {
                                Circle().fill(color(for: call)).frame(width: 14, height: 14)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(call.rawValue)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundStyle(Brand.textPrimary)
                                    Text(call.description)
                                        .font(.system(size: 12))
                                        .foregroundStyle(Brand.textSecondary)
                                }
                                Spacer()
                                Image(systemName: clinicianCall == call ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 20))
                                    .foregroundStyle(clinicianCall == call ? color(for: call) : Brand.textSecondary.opacity(0.4))
                            }
                            .padding(12)
                            .background(
                                clinicianCall == call ? color(for: call).opacity(0.08) : Color(.tertiarySystemBackground),
                                in: .rect(cornerRadius: 12)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(clinicianCall == call ? color(for: call) : Brand.hairline, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func color(for c: ClinicianCall) -> Color {
        switch c {
        case .red: return Brand.danger
        case .amber: return Brand.warning
        case .green: return Brand.success
        }
    }

    // MARK: - Reusable inputs (mirrored from BackAssessmentInline)

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private func slider(title: String, value: Binding<Double>, range: ClosedRange<Double>, unit: String, precision: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                Text("\(String(format: "%.\(precision)f", value.wrappedValue)) \(unit)")
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(Brand.navyMid)
                    .monospacedDigit()
            }
            Slider(value: value, in: range).tint(Brand.navyMid)
        }
    }

    private func stepper(_ title: String, value: Binding<Int>, range: ClosedRange<Int>, unit: String) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            Stepper(value: value, in: range) {
                Text("\(value.wrappedValue) \(unit)")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(Brand.navyMid)
                    .monospacedDigit()
            }
            .labelsHidden()
            Text("\(value.wrappedValue) \(unit)")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.navyMid)
                .monospacedDigit()
                .frame(minWidth: 60, alignment: .trailing)
        }
    }

    private func picker(_ title: String, selection: Binding<String>, options: [String]) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            Menu {
                ForEach(options, id: \.self) { opt in
                    Button(opt.isEmpty ? "—" : opt) { selection.wrappedValue = opt }
                }
            } label: {
                HStack(spacing: 4) {
                    Text(selection.wrappedValue.isEmpty ? "—" : selection.wrappedValue)
                        .font(.system(size: 13, weight: .semibold))
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 10, weight: .bold))
                }
                .foregroundStyle(Brand.navyMid)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(Brand.navyMid.opacity(0.1), in: .capsule)
            }
        }
    }

    private func textField(_ placeholder: String, text: Binding<String>) -> some View {
        TextField(placeholder, text: text, axis: .vertical)
            .font(.system(size: 14))
            .padding(10)
            .background(Color(.tertiarySystemBackground), in: .rect(cornerRadius: 10))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Brand.hairline, lineWidth: 1))
    }

    private func toggleRow(_ label: String, icon: String, isOn: Binding<Bool>, tint: Color = Brand.navyMid) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: 26, height: 26)
                .background(tint.opacity(0.12), in: Circle())
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            Toggle("", isOn: isOn).labelsHidden().tint(tint)
        }
    }

    private func scaleRow(_ title: String, value: Binding<Int>) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            HStack(spacing: 6) {
                ForEach(0...3, id: \.self) { i in
                    Button {
                        value.wrappedValue = i
                    } label: {
                        Text("\(i)")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .frame(width: 34, height: 30)
                            .foregroundStyle(value.wrappedValue == i ? .white : Brand.textPrimary)
                            .background(
                                value.wrappedValue == i ? AnyShapeStyle(Brand.navyMid) : AnyShapeStyle(Color(.tertiarySystemBackground)),
                                in: .rect(cornerRadius: 8)
                            )
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(value.wrappedValue == i ? Color.clear : Brand.hairline, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func mmtRow(_ title: String, value: Binding<Int>) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 13.5, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            HStack(spacing: 4) {
                ForEach(0...5, id: \.self) { i in
                    Button {
                        value.wrappedValue = i
                    } label: {
                        Text("\(i)")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                            .frame(width: 28, height: 28)
                            .foregroundStyle(value.wrappedValue == i ? .white : Brand.textPrimary)
                            .background(
                                value.wrappedValue == i ? AnyShapeStyle(mmtColor(i)) : AnyShapeStyle(Color(.tertiarySystemBackground)),
                                in: .rect(cornerRadius: 8)
                            )
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(value.wrappedValue == i ? Color.clear : Brand.hairline, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func mmtColor(_ i: Int) -> Color {
        switch i {
        case 0, 1, 2: return Brand.danger
        case 3: return Brand.warning
        default: return Brand.success
        }
    }

    private func gradedRow(_ title: String, finding: Binding<GradedFinding>, showLocation: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.system(size: 13.5, weight: .semibold))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                HStack(spacing: 4) {
                    ForEach(GradedScore.allCases) { score in
                        Button {
                            finding.wrappedValue.graded = score
                        } label: {
                            Text("\(score.rawValue)")
                                .font(.system(size: 12, weight: .bold, design: .rounded))
                                .frame(width: 32, height: 28)
                                .foregroundStyle(finding.wrappedValue.graded == score ? .white : Brand.textPrimary)
                                .background(
                                    finding.wrappedValue.graded == score ? AnyShapeStyle(gradedColor(score)) : AnyShapeStyle(Color(.tertiarySystemBackground)),
                                    in: .rect(cornerRadius: 8)
                                )
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(finding.wrappedValue.graded == score ? Color.clear : Brand.hairline, lineWidth: 1))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            if showLocation {
                TextField("Location", text: finding.location)
                    .font(.system(size: 13))
                    .padding(8)
                    .background(Color(.tertiarySystemBackground), in: .rect(cornerRadius: 8))
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Brand.hairline, lineWidth: 1))
            }
        }
        .padding(.vertical, 2)
    }

    private func gradedColor(_ s: GradedScore) -> Color {
        switch s {
        case .zero: return Brand.success
        case .three: return Brand.warning
        case .five: return Brand.danger
        }
    }

    // MARK: - Run

    private func run() {
        isAnalyzing = true
        Task {
            try? await Task.sleep(for: .milliseconds(700))
            var r = ShoulderRulesEngine.evaluate(a)
            r.clinicianCall = clinicianCall
            store.add(r)
            isAnalyzing = false
            result = r
        }
    }
}
