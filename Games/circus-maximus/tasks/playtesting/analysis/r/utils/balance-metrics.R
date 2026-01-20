# Balance Metrics Calculation Functions
# Reusable functions for calculating game balance metrics

library(dplyr)

#' Calculate victory track balance metrics
#'
#' @param df Data frame with playtest results
#' @return Data frame with balance metrics
calculate_track_balance <- function(df) {
  track_wins <- df %>%
    filter(completed == TRUE, !is.na(win_track)) %>%
    count(win_track, name = "wins") %>%
    mutate(
      win_rate = wins / sum(wins),
      expected_rate = 1/3,
      difference = win_rate - expected_rate,
      is_balanced = abs(difference) <= 0.1  # Within 10% of expected
    )
  
  return(track_wins)
}

#' Calculate game length statistics
#'
#' @param df Data frame with playtest results
#' @return Data frame with game length stats
calculate_game_length_stats <- function(df) {
  stats <- df %>%
    filter(completed == TRUE) %>%
    summarise(
      mean = mean(rounds),
      median = median(rounds),
      sd = sd(rounds),
      min = min(rounds),
      max = max(rounds),
      q25 = quantile(rounds, 0.25),
      q75 = quantile(rounds, 0.75),
      is_acceptable = mean >= 6 & mean <= 10  # Target 6-10 rounds
    )
  
  return(stats)
}

#' Test if tracks are balanced (chi-square test)
#'
#' @param df Data frame with playtest results
#' @return List with test results
test_track_balance <- function(df) {
  track_wins <- df %>%
    filter(completed == TRUE, !is.na(win_track)) %>%
    count(win_track)
  
  if(nrow(track_wins) != 3) {
    return(list(
      balanced = NA,
      p_value = NA,
      message = "Need exactly 3 tracks for balance test"
    ))
  }
  
  observed <- track_wins$n
  expected <- rep(sum(observed) / 3, 3)
  chisq_result <- chisq.test(observed, p = rep(1/3, 3))
  
  return(list(
    balanced = chisq_result$p.value >= 0.05,
    p_value = chisq_result$p.value,
    chi_square = as.numeric(chisq_result$statistic),
    message = if(chisq_result$p.value < 0.05) {
      "Tracks are NOT balanced (p < 0.05)"
    } else {
      "Tracks are balanced (p >= 0.05)"
    }
  ))
}

#' Calculate confidence intervals for metrics
#'
#' @param df Data frame with playtest results
#' @param metric Column name for metric
#' @param confidence Confidence level (default 0.95)
#' @return Data frame with CI
calculate_confidence_interval <- function(df, metric, confidence = 0.95) {
  values <- df[[metric]]
  n <- length(values)
  mean_val <- mean(values, na.rm = TRUE)
  sd_val <- sd(values, na.rm = TRUE)
  se <- sd_val / sqrt(n)
  
  alpha <- 1 - confidence
  t_crit <- qt(1 - alpha/2, n - 1)
  
  margin <- t_crit * se
  
  result <- data.frame(
    metric = metric,
    mean = mean_val,
    sd = sd_val,
    n = n,
    lower = mean_val - margin,
    upper = mean_val + margin,
    confidence = confidence
  )
  
  return(result)
}

#' Identify outlier games
#'
#' @param df Data frame with playtest results
#' @param metric Column name for metric
#' @param threshold Number of standard deviations (default 2)
#' @return Data frame with outliers
identify_outliers <- function(df, metric, threshold = 2) {
  values <- df[[metric]]
  mean_val <- mean(values, na.rm = TRUE)
  sd_val <- sd(values, na.rm = TRUE)
  
  df %>%
    mutate(
      z_score = abs({{metric}} - mean_val) / sd_val,
      is_outlier = z_score > threshold
    ) %>%
    filter(is_outlier) %>%
    select(game_id, {{metric}}, z_score)
}

#' Compare two configurations
#'
#' @param df1 Data frame for config 1
#' @param df2 Data frame for config 2
#' @param metric Column name for metric to compare
#' @return List with comparison results
compare_configs <- function(df1, df2, metric = "rounds") {
  val1 <- df1[[metric]]
  val2 <- df2[[metric]]
  
  t_test <- t.test(val1, val2)
  
  return(list(
    config1_mean = mean(val1),
    config2_mean = mean(val2),
    difference = mean(val1) - mean(val2),
    p_value = t_test$p.value,
    significant = t_test$p.value < 0.05,
    t_statistic = t_test$statistic,
    message = if(t_test$p.value < 0.05) {
      sprintf("Significant difference (p = %.4f): Config 1 mean = %.2f, Config 2 mean = %.2f",
              t_test$p.value, mean(val1), mean(val2))
    } else {
      sprintf("No significant difference (p = %.4f)", t_test$p.value)
    }
  ))
}
