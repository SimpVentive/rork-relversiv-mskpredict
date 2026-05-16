//
//  ContentView.swift
//  MSKPredict
//

import SwiftUI

struct RootView: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        ZStack {
            if session.isSignedIn {
                MainTabView()
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .scale(scale: 1.02)),
                        removal: .opacity
                    ))
            } else {
                SignInView()
                    .transition(.opacity)
            }
        }
    }
}

// Keep ContentView name for compatibility / previews.
struct ContentView: View {
    var body: some View { RootView() }
}

#Preview {
    RootView()
        .environment(SessionStore())
}
