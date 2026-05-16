//
//  NewPredictionView.swift
//  MSKPredict
//

import SwiftUI

struct NewPredictionView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(PredictionStore.self) private var store

    @State private var input = PatientInput()
    @State private var isAnalyzing = false
    @State private var result: PredictionResult?
    @State private var showBackForm = false
    @State private var showShoulderForm = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    intro
                    regionCard
                    demographicsCard
                    clinicalCard
                    flagsCard
                    runButton
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .padding(.bottom, 40)
            }
            .background(Brand.surface)
            .navigationTitle("New Prediction")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Brand.navyMid)
                }
            }
            .navigationDestination(item: $result) { r in
                PredictionDetailView(result: r)
            }
            .navigationDestination(isPresented: $showBackForm) {
                BackAssessmentInline()
            }
            .navigationDestination(isPresented: $showShoulderForm) {
                ShoulderAssessmentInline()
            }
        }
        .presentationDragIndicator(.visible)
    }

    private var intro: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Patient profile")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.textPrimary)
            Text("Provide assessment data — the rules engine will evaluate \(RulesEngine.allRules.count) clinical rules and return an explainable risk score.")
                .font(.system(size: 13))
                .foregroundStyle(Brand.textSecondary)
        }
    }

    private func card<Content: View>(_ title: String, icon: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Brand.navyMid)
                    .frame(width: 26, height: 26)
                    .background(Brand.navyMid.opacity(0.1), in: Circle())
                Text(title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(Brand.textPrimary)
            }
            content()
        }
        .padding(16)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private var regionCard: some View {
        card("Pain region", icon: "figure.walk") {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3), spacing: 10) {
                ForEach(PainRegion.allCases) { region in
                    Button {
                        if region == .lowerBack {
                            showBackForm = true
                            return
                        }
                        if region == .shoulder {
                            showShoulderForm = true
                            return
                        }
                        withAnimation(.snappy) { input.region = region }
                    } label: {
                        VStack(spacing: 6) {
                            Image(systemName: region.icon)
                                .font(.system(size: 20, weight: .semibold))
                            Text(region.rawValue)
                                .font(.system(size: 11, weight: .semibold))
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .foregroundStyle(input.region == region ? .white : Brand.textPrimary)
                        .background(
                            input.region == region ? AnyShapeStyle(Brand.navyMid) : AnyShapeStyle(Color(.tertiarySystemBackground)),
                            in: .rect(cornerRadius: 12)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(input.region == region ? Color.clear : Brand.hairline, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var demographicsCard: some View {
        card("Demographics", icon: "person.crop.circle.fill") {
            slider(title: "Age", value: $input.age, range: 18...90, unit: "yrs", precision: 0)
            slider(title: "BMI", value: $input.bmi, range: 16...45, unit: "kg/m²", precision: 1)
        }
    }

    private var clinicalCard: some View {
        card("Clinical assessment", icon: "waveform.path.ecg") {
            slider(title: "Pain (NRS)", value: $input.painScore, range: 0...10, unit: "/10", precision: 0)
            slider(title: "Duration", value: $input.painDurationWeeks, range: 0...52, unit: "wks", precision: 0)
            toggle("Radiating pain", icon: "bolt.fill", isOn: $input.radiatingPain)
            toggle("Prior episodes", icon: "arrow.counterclockwise", isOn: $input.priorEpisodes)
        }
    }

    private var flagsCard: some View {
        card("Risk factors", icon: "shield.lefthalf.filled") {
            toggle("Red-flag symptoms", icon: "exclamationmark.octagon.fill", isOn: $input.redFlagSymptoms, tint: Brand.danger)
            toggle("Psychosocial distress", icon: "brain.head.profile", isOn: $input.psychosocialDistress)
            toggle("Sedentary lifestyle", icon: "chair.lounge.fill", isOn: $input.sedentary)
            toggle("Current smoker", icon: "smoke.fill", isOn: $input.smoker)
        }
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
            Slider(value: value, in: range)
                .tint(Brand.navyMid)
        }
        .padding(.vertical, 2)
    }

    private func toggle(_ label: String, icon: String, isOn: Binding<Bool>, tint: Color = Brand.navyMid) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: 26, height: 26)
                .background(tint.opacity(0.12), in: Circle())
            Text(label)
                .font(.system(size: 14.5, weight: .medium))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(tint)
        }
        .padding(.vertical, 4)
    }

    private var runButton: some View {
        Button {
            run()
        } label: {
            HStack(spacing: 8) {
                if isAnalyzing {
                    ProgressView().tint(.white)
                    Text("Analyzing…")
                } else {
                    Image(systemName: "sparkles")
                    Text("Run prediction")
                }
            }
            .font(.system(size: 17, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(Brand.heroGradient, in: .rect(cornerRadius: 14))
            .shadow(color: Brand.navy.opacity(0.35), radius: 14, x: 0, y: 8)
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(isAnalyzing)
        .padding(.top, 8)
    }

    private func run() {
        isAnalyzing = true
        Task {
            try? await Task.sleep(for: .milliseconds(700))
            let r = RulesEngine.evaluate(input)
            store.add(r)
            isAnalyzing = false
            result = r
        }
    }
}
