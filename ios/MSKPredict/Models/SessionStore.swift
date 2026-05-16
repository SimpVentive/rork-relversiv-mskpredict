//
//  SessionStore.swift
//  MSKPredict
//

import SwiftUI

enum UserRole: String, CaseIterable, Identifiable {
    case admin = "System Owner / Admin"
    case hospital = "Hospital Administrator"
    case researcher = "Researcher"
    case clinician = "Clinician"

    var id: String { rawValue }
    var icon: String {
        switch self {
        case .admin: return "key.horizontal.fill"
        case .hospital: return "building.2.fill"
        case .researcher: return "books.vertical.fill"
        case .clinician: return "stethoscope"
        }
    }
}

@Observable
final class SessionStore {
    var isSignedIn: Bool = false
    var email: String = ""
    var role: UserRole = .clinician
    var hospital: String = "Mercy General Hospital"

    func signIn(email: String, role: UserRole) {
        self.email = email
        self.role = role
        withAnimation(.spring(response: 0.55, dampingFraction: 0.85)) {
            self.isSignedIn = true
        }
    }

    func signOut() {
        withAnimation(.spring(response: 0.5, dampingFraction: 0.85)) {
            self.isSignedIn = false
        }
    }
}
