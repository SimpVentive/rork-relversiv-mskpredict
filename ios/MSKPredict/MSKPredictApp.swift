//
//  MSKPredictApp.swift
//  MSKPredict
//

import SwiftUI

@main
struct MSKPredictApp: App {
    @State private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .preferredColorScheme(.light)
        }
    }
}
