//
//  MainTabView.swift
//  MSKPredict
//

import SwiftUI

@Observable
final class PredictionStore {
    var results: [PredictionResult] = []

    func add(_ r: PredictionResult) {
        results.insert(r, at: 0)
    }
}

struct MainTabView: View {
    @State private var store = PredictionStore()
    @State private var showNewPrediction = false

    var body: some View {
        TabView {
            NavigationStack {
                HomeView(showNewPrediction: $showNewPrediction)
            }
            .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationStack {
                RulesLibraryView()
            }
            .tabItem { Label("Rules", systemImage: "list.bullet.rectangle.portrait.fill") }

            NavigationStack {
                ProfileView()
            }
            .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
        }
        .tint(Brand.navyMid)
        .environment(store)
        .sheet(isPresented: $showNewPrediction) {
            NewPredictionView()
                .environment(store)
        }
    }
}
