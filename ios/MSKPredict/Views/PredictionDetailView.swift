//
//  PredictionDetailView.swift
//  MSKPredict
//

import SwiftUI

struct PredictionDetailView: View {
    let result: PredictionResult
    @State private var animatedScore: Double = 0

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                scoreCard
                callCard
                summaryCard
                rulesSection
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
            .padding(.top, 8)
        }
        .background(Brand.surface)
        .navigationTitle("Prediction")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                animatedScore = Double(result.score)
            }
        }
    }

    private var scoreCard: some View {
        VStack(spacing: 14) {
            HStack(spacing: 6) {
                Image(systemName: result.region.icon)
                Text(result.region.rawValue.uppercased())
                    .tracking(1.5)
            }
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(Brand.accent)

            ZStack {
                Circle()
                    .stroke(Brand.accent.opacity(0.12), lineWidth: 14)

                Circle()
                    .trim(from: 0, to: animatedScore / 100)
                    .stroke(
                        AngularGradient(
                            colors: [result.band.color.opacity(0.7), result.band.color],
                            center: .center
                        ),
                        style: StrokeStyle(lineWidth: 14, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 2) {
                    Text("\(Int(animatedScore))")
                        .font(.system(size: 54, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .monospacedDigit()
                    Text("RISK SCORE")
                        .tracking(2)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            .frame(width: 180, height: 180)

            HStack(spacing: 8) {
                Circle().fill(result.band.color).frame(width: 8, height: 8)
                Text(result.band.rawValue + " risk")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(.white.opacity(0.12), in: .capsule)
            .overlay(Capsule().stroke(.white.opacity(0.2), lineWidth: 1))
        }
        .padding(.vertical, 28)
        .frame(maxWidth: .infinity)
        .background(Brand.heroGradient, in: .rect(cornerRadius: 22))
        .shadow(color: Brand.navy.opacity(0.3), radius: 18, x: 0, y: 10)
    }

    private var callCard: some View {
        HStack(spacing: 12) {
            callPill(title: "Predicted", call: result.predictedCall)
            if let truth = result.clinicianCall {
                callPill(title: "Clinician", call: truth)
                let match = truth == result.predictedCall
                Image(systemName: match ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(match ? Brand.success : Brand.warning)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(14)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private func callPill(title: String, call: ClinicianCall) -> some View {
        let color: Color = {
            switch call {
            case .red: return Brand.danger
            case .amber: return Brand.warning
            case .green: return Brand.success
            }
        }()
        return VStack(spacing: 4) {
            Text(title.uppercased())
                .tracking(1.2)
                .font(.system(size: 9.5, weight: .bold))
                .foregroundStyle(Brand.textSecondary)
            HStack(spacing: 6) {
                Circle().fill(color).frame(width: 8, height: 8)
                Text(call.rawValue)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Brand.textPrimary)
            }
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(color.opacity(0.12), in: .capsule)
        }
        .frame(maxWidth: .infinity)
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "stethoscope")
                    .foregroundStyle(Brand.navyMid)
                Text("Recommendation")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(Brand.textPrimary)
            }
            Text(result.band.summary)
                .font(.system(size: 14.5, weight: .medium))
                .foregroundStyle(Brand.textPrimary)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 6) {
                Image(systemName: "info.circle")
                Text("Decision support only — not a substitute for clinical judgment.")
            }
            .font(.system(size: 11.5))
            .foregroundStyle(Brand.textSecondary)
            .padding(.top, 4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private var rulesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Rules fired")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                Text("\(result.firedRules.count) of \(totalRulesForCondition)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Brand.textSecondary)
            }

            if result.firedRules.isEmpty {
                Text("No risk-elevating rules matched this profile.")
                    .font(.system(size: 13))
                    .foregroundStyle(Brand.textSecondary)
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
            } else {
                VStack(spacing: 10) {
                    ForEach(Array(result.firedRules.enumerated()), id: \.element.id) { _, fired in
                        FiredRuleRow(fired: fired)
                    }
                }
            }
        }
    }

    private var totalRulesForCondition: Int {
        switch result.condition {
        case .back: return BackRulesEngine.rules.count
        case .shoulder: return ShoulderRulesEngine.rules.count
        default: return RulesEngine.allRules.count
        }
    }
}

struct FiredRuleRow: View {
    let fired: FiredRule

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(fired.rule.category.color.opacity(0.15))
                Image(systemName: fired.rule.category.icon)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(fired.rule.category.color)
            }
            .frame(width: 36, height: 36)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(fired.rule.name)
                        .font(.system(size: 14.5, weight: .semibold))
                        .foregroundStyle(Brand.textPrimary)
                    Spacer()
                    Text("+\(fired.rule.weight)")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundStyle(fired.rule.category.color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(fired.rule.category.color.opacity(0.12), in: .capsule)
                }
                Text(fired.evidence)
                    .font(.system(size: 12.5))
                    .foregroundStyle(Brand.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(fired.rule.id + " · " + fired.rule.category.rawValue)
                    .font(.system(size: 10.5, weight: .semibold))
                    .foregroundStyle(Brand.textSecondary.opacity(0.7))
                    .tracking(0.5)
            }
        }
        .padding(14)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Brand.hairline, lineWidth: 1))
    }
}
