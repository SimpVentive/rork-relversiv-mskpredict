//
//  RulesLibraryView.swift
//  MSKPredict
//

import SwiftUI

struct RulesLibraryView: View {
    @State private var filter: ClinicalRule.Category?
    @State private var search: String = ""
    @State private var condition: ConditionType = .back

    private var allForCondition: [ClinicalRule] {
        switch condition {
        case .back: return BackRulesEngine.rules
        case .shoulder: return ShoulderRulesEngine.rules
        case .knee: return RulesEngine.allRules
        }
    }

    private var filtered: [ClinicalRule] {
        allForCondition.filter { rule in
            (filter == nil || rule.category == filter) &&
            (search.isEmpty ||
             rule.name.localizedStandardContains(search) ||
             rule.description.localizedStandardContains(search))
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header

                conditionPicker

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        chip("All", selected: filter == nil) { filter = nil }
                        ForEach(ClinicalRule.Category.allCases, id: \.self) { cat in
                            chip(cat.rawValue, color: cat.color, selected: filter == cat) {
                                filter = filter == cat ? nil : cat
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .contentMargins(.horizontal, 0, for: .scrollContent)

                VStack(spacing: 10) {
                    ForEach(filtered) { rule in
                        RuleCard(rule: rule)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 28)
            }
        }
        .background(Brand.surface)
        .navigationTitle("Rules Library")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $search, placement: .navigationBarDrawer(displayMode: .always), prompt: "Search rules")
    }

    private var conditionPicker: some View {
        HStack(spacing: 8) {
            ForEach(ConditionType.allCases) { c in
                Button {
                    withAnimation(.snappy) { condition = c }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: c.icon)
                            .font(.system(size: 12, weight: .bold))
                        Text(c.title)
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .padding(.horizontal, 14).padding(.vertical, 9)
                    .foregroundStyle(condition == c ? .white : Brand.textPrimary)
                    .background(
                        condition == c ? AnyShapeStyle(Brand.navyMid) : AnyShapeStyle(Brand.surfaceElevated),
                        in: .capsule
                    )
                    .overlay(Capsule().stroke(condition == c ? Color.clear : Brand.hairline, lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(.horizontal, 20)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(allForCondition.count) active rules")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Brand.textSecondary)
            Text("Every rule is explainable — fire conditions and weights are transparent to clinicians.")
                .font(.system(size: 13))
                .foregroundStyle(Brand.textSecondary)
        }
        .padding(.horizontal, 20)
    }

    private func chip(_ label: String, color: Color = Brand.navyMid, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .foregroundStyle(selected ? .white : Brand.textPrimary)
                .background(
                    selected ? AnyShapeStyle(color) : AnyShapeStyle(Brand.surfaceElevated),
                    in: .capsule
                )
                .overlay(Capsule().stroke(selected ? Color.clear : Brand.hairline, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

struct RuleCard: View {
    let rule: ClinicalRule

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(rule.category.color.opacity(0.15))
                Image(systemName: rule.category.icon)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(rule.category.color)
            }
            .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 6) {
                    Text(rule.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Brand.textPrimary)
                    Spacer()
                    Text("w \(rule.weight)")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(rule.category.color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(rule.category.color.opacity(0.12), in: .capsule)
                }
                Text(rule.description)
                    .font(.system(size: 12.5))
                    .foregroundStyle(Brand.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                HStack(spacing: 6) {
                    Text(rule.id)
                        .font(.system(size: 10.5, weight: .bold, design: .monospaced))
                    Circle().fill(Brand.textSecondary.opacity(0.4)).frame(width: 3, height: 3)
                    Text(rule.category.rawValue)
                        .font(.system(size: 10.5, weight: .semibold))
                }
                .foregroundStyle(Brand.textSecondary.opacity(0.8))
            }
        }
        .padding(14)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Brand.hairline, lineWidth: 1))
    }
}
