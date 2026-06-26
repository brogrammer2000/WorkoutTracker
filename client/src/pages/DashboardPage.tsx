import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { calculateCalories } from "@/lib/calories";

const goalLabels: Record<string, string> = {
  lose_weight: "Lose Weight",
  gain_muscle: "Gain Muscle",
  recomp: "Body Recomposition",
  maintain: "Maintain",
  endurance: "Endurance",
};

export default function DashboardPage() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const calories = profile ? calculateCalories(profile) : null;
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.appName}>WorkoutTracker</h1>
        <div style={styles.navLinks}>
          <Link to="/chat" style={styles.navLink}>
            AI Trainer
          </Link>
          <Link to="/workouts" style={styles.navLink}>
            Workouts
          </Link>
          <Link to="/onboarding" style={styles.navLink}>
            Edit Profile Info
          </Link>
          {confirmingSignOut ? (
            <span style={styles.confirmRow}>
              <span style={styles.confirmText}>Sign out?</span>
              <button style={styles.confirmYes} onClick={signOut}>Yes</button>
              <button style={styles.confirmNo} onClick={() => setConfirmingSignOut(false)}>Cancel</button>
            </span>
          ) : (
            <button style={styles.signOut} onClick={() => setConfirmingSignOut(true)}>
              Sign out
            </button>
          )}
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.greeting}>
          {profile?.goal ? `Goal: ${goalLabels[profile.goal]}` : "Dashboard"}
        </h2>

        {calories ? (
          <>
            <div style={styles.grid}>
              <StatCard
                label="Maintenance calories"
                value={`${calories.tdee} kcal`}
              />
              <StatCard
                label={calories.targetLabel}
                value={`${calories.target} kcal`}
                highlight
              />
              <StatCard label="BMR" value={`${calories.bmr} kcal`} />
            </div>

            <div style={styles.macrosCard}>
              <p style={styles.macrosTitle}>Daily macro targets</p>
              <div style={styles.macrosRow}>
                <MacroItem
                  label="Protein"
                  value={calories.protein_g}
                  unit="g"
                  color="#4ade80"
                />
                <MacroItem
                  label="Carbs"
                  value={calories.carbs_g}
                  unit="g"
                  color="#60a5fa"
                />
                <MacroItem
                  label="Fat"
                  value={calories.fat_g}
                  unit="g"
                  color="#f59e0b"
                />
              </div>
            </div>
          </>
        ) : (
          <p style={styles.hint}>
            Complete your profile to see calorie targets.
          </p>
        )}

        <div style={styles.ctaCard}>
          <div>
            <p style={styles.ctaLabel}>Workouts</p>
            <p style={styles.ctaText}>
              Choose your training split and select the exercises in your programme.
            </p>
          </div>
          <Link to="/workouts" style={styles.ctaBtn}>
            Configure workouts →
          </Link>
        </div>

        <div style={styles.ctaCard}>
          <div>
            <p style={styles.ctaLabel}>AI Trainer</p>
            <p style={styles.ctaText}>
              Chat with your AI personal trainer for personalised workout and diet advice.
            </p>
          </div>
          <Link to="/chat" style={styles.ctaBtn}>
            Open AI Trainer →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(highlight ? styles.statCardHighlight : {}),
      }}
    >
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

function MacroItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div style={styles.macroItem}>
      <p style={{ ...styles.macroValue, color }}>
        {value}
        {unit}
      </p>
      <p style={styles.macroLabel}>{label}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #222",
  },
  appName: { fontSize: 18, fontWeight: 700 },
  navLinks: { display: "flex", alignItems: "center", gap: 20 },
  navLink: { color: "#ccc", textDecoration: "none", fontSize: 14 },
  signOut: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 14,
    cursor: "pointer",
  },
  confirmRow: { display: "flex", alignItems: "center", gap: 8 },
  confirmText: { fontSize: 13, color: "#ccc" },
  confirmYes: { padding: "4px 12px", background: "#f87171", color: "#000", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  confirmNo: { padding: "4px 12px", background: "none", border: "1px solid #444", borderRadius: 6, color: "#888", fontSize: 13, cursor: "pointer" },
  content: { maxWidth: 800, margin: "0 auto", padding: "32px 24px" },
  greeting: { fontSize: 24, fontWeight: 600, marginBottom: 24 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "20px 24px",
  },
  statCardHighlight: { border: "1px solid #2d5a3d", background: "#0f2318" },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statValue: { fontSize: 26, fontWeight: 700 },
  macrosCard: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  macrosRow: { display: "flex", gap: 32 },
  macroItem: { display: "flex", flexDirection: "column", gap: 4 },
  macroValue: { fontSize: 28, fontWeight: 700 },
  macroLabel: { fontSize: 12, color: "#888" },
  ctaCard: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  ctaLabel: { fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 },
  ctaText: { fontSize: 14, color: "#ccc", maxWidth: 460 },
  ctaBtn: {
    padding: "10px 20px",
    background: "#4ade80",
    color: "#000",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  hint: { color: "#888", fontSize: 14 },
};
