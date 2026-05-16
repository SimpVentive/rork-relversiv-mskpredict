//
//  Brand.swift
//  MSKPredict
//

import SwiftUI

enum Brand {
    // Deep clinical navy palette
    static let navyDeep = Color(red: 11/255, green: 42/255, blue: 74/255)        // #0B2A4A
    static let navy = Color(red: 16/255, green: 58/255, blue: 102/255)           // #103A66
    static let navyMid = Color(red: 30/255, green: 78/255, blue: 130/255)        // #1E4E82
    static let accent = Color(red: 34/255, green: 211/255, blue: 238/255)        // #22D3EE cyan
    static let accentSoft = Color(red: 125/255, green: 211/255, blue: 252/255)   // #7DD3FC
    static let success = Color(red: 34/255, green: 197/255, blue: 94/255)        // #22C55E
    static let warning = Color(red: 245/255, green: 158/255, blue: 11/255)       // #F59E0B
    static let danger  = Color(red: 239/255, green: 68/255, blue: 68/255)        // #EF4444

    static let surface = Color(.systemBackground)
    static let surfaceElevated = Color(.secondarySystemBackground)
    static let hairline = Color.black.opacity(0.08)
    static let textPrimary = Color(red: 17/255, green: 24/255, blue: 39/255)     // #111827
    static let textSecondary = Color(red: 75/255, green: 85/255, blue: 99/255)   // #4B5563

    static var heroGradient: LinearGradient {
        LinearGradient(
            colors: [navyDeep, navy, navyMid],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
