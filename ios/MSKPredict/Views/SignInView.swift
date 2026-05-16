//
//  SignInView.swift
//  MSKPredict
//

import SwiftUI

struct SignInView: View {
    @Environment(SessionStore.self) private var session

    @State private var email: String = ""
    @State private var password: String = ""
    @State private var rememberMe: Bool = true
    @State private var role: UserRole = .clinician
    @State private var isLoading: Bool = false
    @State private var heroAppeared: Bool = false
    @FocusState private var focused: Field?

    private enum Field { case email, password }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                heroSection
                formSection
                    .padding(.horizontal, 20)
                    .padding(.top, 28)
                    .padding(.bottom, 40)
            }
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Brand.surface)
        .ignoresSafeArea(.container, edges: .top)
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.8).delay(0.05)) {
                heroAppeared = true
            }
        }
    }

    // MARK: Hero

    private var heroSection: some View {
        ZStack(alignment: .topLeading) {
            Brand.heroGradient
                .overlay(alignment: .topTrailing) {
                    decorPulse
                        .offset(x: 60, y: 30)
                }
                .overlay(alignment: .bottomLeading) {
                    decorRing
                        .offset(x: -90, y: 40)
                }

            VStack(alignment: .leading, spacing: 14) {
                brandRow
                    .padding(.top, 70)

                Spacer().frame(height: 18)

                Text("MSK Pain Prediction\nRules Engine")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .lineSpacing(2)
                    .opacity(heroAppeared ? 1 : 0)
                    .offset(y: heroAppeared ? 0 : 12)

                Text("Clinical decision support powered by explainable AI.")
                    .font(.system(size: 15.5, weight: .regular))
                    .foregroundStyle(.white.opacity(0.78))
                    .opacity(heroAppeared ? 1 : 0)
                    .offset(y: heroAppeared ? 0 : 12)

                VStack(alignment: .leading, spacing: 10) {
                    bullet("Real-time predictions")
                    bullet("Explainable AI")
                    bullet("Hospital-specific insights")
                }
                .padding(.top, 14)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 38)
        }
        .clipShape(.rect(cornerRadii: .init(bottomLeading: 28, bottomTrailing: 28)))
    }

    private var brandRow: some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(.white.opacity(0.14))
                    .frame(width: 38, height: 38)
                Image(systemName: "cross.case.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Brand.accent)
            }
            VStack(alignment: .leading, spacing: 0) {
                Text("RelVersiv")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                Text("MSKPredict")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(Brand.accent)
            }
        }
    }

    private func bullet(_ text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Brand.navyDeep)
                .frame(width: 18, height: 18)
                .background(Brand.accent, in: Circle())
            Text(text)
                .font(.system(size: 14.5, weight: .medium))
                .foregroundStyle(.white.opacity(0.92))
        }
        .opacity(heroAppeared ? 1 : 0)
        .offset(x: heroAppeared ? 0 : -10)
    }

    private var decorPulse: some View {
        Circle()
            .stroke(Brand.accent.opacity(0.25), lineWidth: 1)
            .frame(width: 220, height: 220)
            .overlay(
                Circle()
                    .stroke(Brand.accent.opacity(0.12), lineWidth: 1)
                    .padding(28)
            )
    }

    private var decorRing: some View {
        Circle()
            .fill(Brand.accent.opacity(0.08))
            .frame(width: 200, height: 200)
            .blur(radius: 30)
    }

    // MARK: Form

    private var formSection: some View {
        VStack(alignment: .leading, spacing: 22) {
            Text("Sign In")
                .font(.system(size: 26, weight: .bold, design: .rounded))
                .foregroundStyle(Brand.textPrimary)

            Rectangle()
                .fill(Brand.hairline)
                .frame(height: 1)
                .padding(.top, -8)

            field(
                label: "Email or Hospital ID",
                icon: "envelope.fill"
            ) {
                TextField("name@hospital.com", text: $email)
                    .textContentType(.username)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .focused($focused, equals: .email)
                    .submitLabel(.next)
                    .onSubmit { focused = .password }
            }

            field(
                label: "Password",
                icon: "lock.fill"
            ) {
                SecureField("••••••••", text: $password)
                    .textContentType(.password)
                    .focused($focused, equals: .password)
                    .submitLabel(.go)
                    .onSubmit(signIn)
            }

            HStack {
                Button {
                    rememberMe.toggle()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: rememberMe ? "checkmark.square.fill" : "square")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(rememberMe ? Brand.navyMid : Brand.textSecondary)
                        Text("Remember me")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(Brand.textPrimary)
                    }
                }
                .buttonStyle(.plain)

                Spacer()

                Button("Forgot password?") {}
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Brand.navyMid)
            }

            signInButton
                .padding(.top, 4)

            Rectangle()
                .fill(Brand.hairline)
                .frame(height: 1)
                .padding(.vertical, 4)

            VStack(alignment: .leading, spacing: 14) {
                Text("Select your role (optional)")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Brand.textPrimary)

                VStack(spacing: 10) {
                    ForEach(UserRole.allCases) { r in
                        roleRow(r)
                    }
                }
            }

            HStack(spacing: 4) {
                Spacer()
                Text("Questions?")
                    .foregroundStyle(Brand.textSecondary)
                Button("Contact support") {}
                    .foregroundStyle(Brand.navyMid)
                    .fontWeight(.semibold)
                Spacer()
            }
            .font(.system(size: 13))
            .padding(.top, 8)
        }
    }

    private func field<Content: View>(
        label: String,
        icon: String,
        @ViewBuilder _ content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Brand.textSecondary)

            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Brand.navyMid)
                    .frame(width: 18)
                content()
                    .font(.system(size: 16))
                    .foregroundStyle(Brand.textPrimary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 14)
            .background(Brand.surfaceElevated, in: .rect(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(focused != nil ? Brand.accent.opacity(0.35) : Brand.hairline, lineWidth: 1)
            )
        }
    }

    private func roleRow(_ r: UserRole) -> some View {
        Button {
            withAnimation(.snappy(duration: 0.2)) { role = r }
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .stroke(role == r ? Brand.navyMid : Brand.hairline, lineWidth: 1.5)
                        .frame(width: 20, height: 20)
                    if role == r {
                        Circle()
                            .fill(Brand.navyMid)
                            .frame(width: 11, height: 11)
                            .transition(.scale)
                    }
                }
                Image(systemName: r.icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(role == r ? Brand.navyMid : Brand.textSecondary)
                    .frame(width: 22)
                Text(r.rawValue)
                    .font(.system(size: 15, weight: role == r ? .semibold : .regular))
                    .foregroundStyle(Brand.textPrimary)
                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                role == r ? Brand.navyMid.opacity(0.06) : Color.clear,
                in: .rect(cornerRadius: 10)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(role == r ? Brand.navyMid.opacity(0.25) : Brand.hairline, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var signInButton: some View {
        Button(action: signIn) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView().tint(.white)
                } else {
                    Text("Sign In")
                        .font(.system(size: 17, weight: .semibold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 14, weight: .bold))
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(
                LinearGradient(
                    colors: [Brand.navyMid, Brand.navy],
                    startPoint: .leading, endPoint: .trailing
                ),
                in: .rect(cornerRadius: 14)
            )
            .shadow(color: Brand.navy.opacity(0.35), radius: 14, x: 0, y: 8)
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(isLoading)
    }

    private func signIn() {
        let trimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
        focused = nil
        isLoading = true
        Task {
            try? await Task.sleep(for: .milliseconds(650))
            session.signIn(
                email: trimmed.isEmpty ? "clinician@mercy.org" : trimmed,
                role: role
            )
            isLoading = false
        }
    }
}

struct PressableButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

#Preview {
    SignInView()
        .environment(SessionStore())
}
