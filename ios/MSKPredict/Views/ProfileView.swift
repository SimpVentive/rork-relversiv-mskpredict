//
//  ProfileView.swift
//  MSKPredict
//

import SwiftUI

struct ProfileView: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                header
                infoSection
                actionsSection
                footer
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Brand.surface)
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
    }

    private var header: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Brand.heroGradient)
                Text(initials)
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }
            .frame(width: 88, height: 88)
            .shadow(color: Brand.navy.opacity(0.3), radius: 14, x: 0, y: 8)

            Text(session.email)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Brand.textPrimary)

            HStack(spacing: 6) {
                Image(systemName: session.role.icon)
                Text(session.role.rawValue)
            }
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(Brand.navyMid)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Brand.navyMid.opacity(0.1), in: .capsule)
        }
        .padding(.top, 8)
    }

    private var initials: String {
        let name = session.email.split(separator: "@").first.map(String.init) ?? "U"
        return String(name.prefix(2)).uppercased()
    }

    private var infoSection: some View {
        VStack(spacing: 0) {
            row(icon: "building.2.fill", label: "Hospital", value: session.hospital)
            divider
            row(icon: "checkmark.shield.fill", label: "Status", value: "Active")
            divider
            row(icon: "lock.shield.fill", label: "HIPAA mode", value: "Enabled", valueColor: Brand.success)
        }
        .padding(.vertical, 4)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private var actionsSection: some View {
        VStack(spacing: 0) {
            actionRow(icon: "bell.fill", label: "Notifications")
            divider
            actionRow(icon: "person.2.fill", label: "Team members")
            divider
            actionRow(icon: "questionmark.circle.fill", label: "Help & Support")
        }
        .padding(.vertical, 4)
        .background(Brand.surfaceElevated, in: .rect(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.hairline, lineWidth: 1))
    }

    private var footer: some View {
        VStack(spacing: 14) {
            Button {
                session.signOut()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.right.square.fill")
                    Text("Sign out")
                }
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Brand.danger)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Brand.danger.opacity(0.1), in: .rect(cornerRadius: 14))
            }
            .buttonStyle(PressableButtonStyle())

            Text("RelVersiv MSKPredict · v1.0")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Brand.textSecondary)
        }
    }

    private func row(icon: String, label: String, value: String, valueColor: Color = Brand.textPrimary) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Brand.navyMid)
                .frame(width: 28, height: 28)
                .background(Brand.navyMid.opacity(0.1), in: Circle())
            Text(label)
                .font(.system(size: 14.5, weight: .medium))
                .foregroundStyle(Brand.textPrimary)
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(valueColor)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private func actionRow(icon: String, label: String) -> some View {
        Button {} label: {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Brand.navyMid)
                    .frame(width: 28, height: 28)
                    .background(Brand.navyMid.opacity(0.1), in: Circle())
                Text(label)
                    .font(.system(size: 14.5, weight: .medium))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Brand.textSecondary.opacity(0.6))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
    }

    private var divider: some View {
        Rectangle()
            .fill(Brand.hairline)
            .frame(height: 1)
            .padding(.leading, 56)
    }
}
