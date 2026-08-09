package com.examlens.backend.reports

data class ReportSummaryDto(
    val avgScore: String = "78%",
    val passRate: String = "91%",
    val totalViolations: Int = 118,
    val examsDone: Int = 5,
    val scoreDistribution: List<ScoreDistItem> = listOf(
        ScoreDistItem("90-100%", 28),
        ScoreDistItem("75-89%", 45),
        ScoreDistItem("60-74%", 22),
        ScoreDistItem("< 60%", 13)
    ),
    val departmentAverages: List<DeptAvgItem> = listOf(
        DeptAvgItem("Computer Science", "82%"),
        DeptAvgItem("Electronics", "79%"),
        DeptAvgItem("Mechanical", "74%"),
        DeptAvgItem("Civil Engineering", "76%")
    )
)

data class ScoreDistItem(
    val range: String,
    val count: Int
)

data class DeptAvgItem(
    val department: String,
    val avgScore: String
)
