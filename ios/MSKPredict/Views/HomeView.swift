//
//  HomeView.swift
//  MSKPredict
//

import SwiftUI

struct HomeView: View {
    @Environment(SessionStore.self) private var session
    @Environment(PredictionStore.self) private var store
    @Binding var showNewPrediction: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                header
                quickAction
                statsRow
                recentSection
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Brand.surface)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .principal) {
                HStack(spacing: 6) {
                    Image(systemName: "cross.case.fill")
                        .foregroundStyle(Brand.accent)
                    Text("MSKPredict")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(Brand.textPrimary)
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(greeting)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Brand.textSecondary)
            Text(session.email.split(separator: "@").first.map(String.init)?.capitalized ?? "Clinician")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.textPrimary)
            HStack(spacing: 6) {
                Image(systemName: "building.2.fill")
                    .foregroundStyle(Brand.navyMid)
                Text(session.hospital)
                    .foregroundStyle(Brand.textSecondary)
            }
            .font(.system(size: 13, weight: .medium))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: .now)
        switch h {
        case 5..<12: return "Good morning,"
        case 12..<17: return "Good afternoon,"
        default: return "Good evening,"
        }
    }

    private var quickAction: some View {
        Button {
            showNewPrediction = true
        } label: {
            ZStack(alignment: .topTrailing) {
                Brand.heroGradient
                    .overlay(alignment: .bottomTrailing) {
                        Image(systemName: "waveform.path.ecg")
                            .font(.system(size: 110, weight: .thin))
                            .foregroundStyle(.white.opacity(0.08))
                            .offset(x: 20, y: 20)
                    }

                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 11, weight: .bold))
                        Text("AI-POWERED")
                            .tracking(1.5)
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundStyle(Brand.accent)

                    Text("Run a new\nMSK prediction")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.leading)

                    HStack(spacing: 6) {
                        Text("Start assessment")
                            .font(.system(size: 14, weight: .semibold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(.white.opacity(0.18), in: .capsule)
                    .overlay(Capsule().stroke(.white.opacity(0.25), lineWidth: 1))
                    .padding(.top, 4)
                }
                .padding(20)
            }
            .clipShape(.rect(cornerRadius: 22))
            .shadow(color: Brand.navy.opacity(0.25), radius: 18, x: 0, y: 10)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            stat(value: "\(store.results.count)", label: "Predictions", icon: "chart.bar.fill", tint: Brand.navyMid)
            stat(value: "\(RulesEngine.allRules.count)", label: "Active rules", icon: "list.bullet.rectangle", tint: Brand.accent)
            stat(value: highRiskCount, label: "High risk", icon: "exclamationmark.triangle.fill", tint: Brand.warning)
        }
    }

    private var highRiskCount: String {
        "\(store.results.filter { $0.band == .high || $0.band == .veryHigh }.count)"
    }

    private func stat(value: String, label: String, icon: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(tint)
                .padding(7)
                .background(tint.opacity(0.12), in: Circle())
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.textPrimary)
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Brand.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Brand.hairline, lineWidth: 1))
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent predictions")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                if !store.results.isEmpty {
                    Text("\(store.results.count) total")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Brand.textSecondary)
                }
            }
            if store.results.isEmpty {
                emptyState
            } else {
                VStack(spacing: 10) {
                    ForEach(store.results) { r in
                        NavigationLink {
                            PredictionDetailView(result: r)
                        } label: {
                            PredictionRow(result: r)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(Brand.navyMid.opacity(0.5))
            Text("No predictions yet")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)
            Text("Run your first MSK prognosis assessment to see results and fired rules here.")
                .font(.system(size: 13))
                .multilineTextAlignment(.center)
                .foregroundStyle(Brand.textSecondary)
                .padding(.horizontal, 24)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }
}

struct PredictionRow: View {
    let result: PredictionResult

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(result.band.color.opacity(0.15))
                Image(systemName: result.region.icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(result.band.color)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text(result.region.rawValue + " · \(result.chronicityWeeks) wks")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Brand.textPrimary)
                HStack(spacing: 6) {
                    Circle().fill(result.band.color).frame(width: 6, height: 6)
                    Text("\(result.band.rawValue) risk · \(result.firedRules.count) rules fired")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Brand.textSecondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("\(result.score)")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(result.band.color)
                Text("/100")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(Brand.textSecondary)
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Brand.textSecondary.opacity(0.6))
        }
        .padding(14)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Brand.hairline, lineWidth: 1))
    }
}
