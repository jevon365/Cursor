# Load Playtesting Data
# Helper functions for loading and preparing playtest data

library(jsonlite)
library(dplyr)
library(tidyr)
library(readr)

#' Load playtest data from JSON file
#'
#' @param filepath Path to JSON file
#' @return Data frame with game results
load_playtest_json <- function(filepath) {
  data <- fromJSON(filepath)
  
  # Extract metadata
  metadata <- data.frame(
    test_run = data$metadata$testRun %||% "unknown",
    date = data$metadata$date %||% as.Date(Sys.time()),
    config_version = data$metadata$configVersion %||% "v1.0",
    stringsAsFactors = FALSE
  )
  
  # Extract results
  results <- data$results
  
  # Flatten results into data frame
  df <- results %>%
    as_tibble() %>%
    # Expand final scores
    mutate(
      # Game metadata
      game_id = row_number(),
      player_count = playerCount,
      difficulty = difficulty,
      winner = winner,
      win_track = case_when(
        winner != "" ~ winTrack,
        TRUE ~ NA_character_
      ),
      rounds = rounds,
      duration_ms = duration,
      completed = completed,
      timestamp = if("timestamp" %in% names(.)) timestamp else NA_real_
    ) %>%
    # Extract player scores
    mutate(
      # Player 1
      p1_name = map_chr(finalScores, ~ .x[[1]]$name %||% ""),
      p1_empire = map_dbl(finalScores, ~ .x[[1]]$empire %||% 0),
      p1_population = map_dbl(finalScores, ~ .x[[1]]$population %||% 0),
      p1_church = map_dbl(finalScores, ~ .x[[1]]$church %||% 0),
      p1_total = p1_empire + p1_population + p1_church,
      p1_coins = map_dbl(finalScores, ~ .x[[1]]$coins %||% 0),
      # Player 2
      p2_name = map_chr(finalScores, ~ if(length(.x) >= 2) .x[[2]]$name %||% "" else ""),
      p2_empire = map_dbl(finalScores, ~ if(length(.x) >= 2) .x[[2]]$empire %||% 0 else 0),
      p2_population = map_dbl(finalScores, ~ if(length(.x) >= 2) .x[[2]]$population %||% 0 else 0),
      p2_church = map_dbl(finalScores, ~ if(length(.x) >= 2) .x[[2]]$church %||% 0 else 0),
      p2_total = p2_empire + p2_population + p2_church,
      p2_coins = map_dbl(finalScores, ~ if(length(.x) >= 2) .x[[2]]$coins %||% 0 else 0)
    ) %>%
    select(
      game_id, player_count, difficulty, winner, win_track,
      rounds, duration_ms, completed, timestamp,
      p1_name, p1_empire, p1_population, p1_church, p1_total, p1_coins,
      p2_name, p2_empire, p2_population, p2_church, p2_total, p2_coins
    ) %>%
    # Add metadata
    bind_cols(metadata[rep(1, nrow(.)), ]) %>%
    relocate(test_run, date, config_version, .before = game_id)
  
  return(df)
}

#' Load playtest data from CSV file
#'
#' @param filepath Path to CSV file
#' @return Data frame with game results
load_playtest_csv <- function(filepath) {
  df <- read_csv(filepath, col_types = cols(
    game_id = col_integer(),
    timestamp = col_double(),
    player_count = col_integer(),
    difficulty = col_character(),
    winner = col_character(),
    win_track = col_character(),
    rounds = col_integer(),
    duration_ms = col_double(),
    completed = col_logical(),
    .default = col_double()
  ))
  
  return(df)
}

#' Convert wide format to long format for analysis
#'
#' @param df Wide format data frame
#' @return Long format data frame (one row per player per game)
wide_to_long <- function(df) {
  df_long <- df %>%
    select(game_id, player_count, test_run, config_version, rounds, winner, win_track) %>%
    # Player 1
    bind_rows(
      df %>%
        select(game_id, player_count, test_run, config_version, rounds, winner, win_track,
               player_name = p1_name, empire = p1_empire, population = p1_population,
               church = p1_church, total = p1_total, coins = p1_coins) %>%
        filter(!is.na(player_name), player_name != "")
    ) %>%
    # Player 2
    bind_rows(
      df %>%
        select(game_id, player_count, test_run, config_version, rounds, winner, win_track,
               player_name = p2_name, empire = p2_empire, population = p2_population,
               church = p2_church, total = p2_total, coins = p2_coins) %>%
        filter(!is.na(player_name), player_name != "")
    ) %>%
    # Player 3 (if exists)
    {
      if("p3_name" %in% names(df)) {
        bind_rows(.,
          df %>%
            select(game_id, player_count, test_run, config_version, rounds, winner, win_track,
                   player_name = p3_name, empire = p3_empire, population = p3_population,
                   church = p3_church, total = p3_total, coins = p3_coins) %>%
            filter(!is.na(player_name), player_name != "")
        )
      } else .
    } %>%
    # Player 4 (if exists)
    {
      if("p4_name" %in% names(df)) {
        bind_rows(.,
          df %>%
            select(game_id, player_count, test_run, config_version, rounds, winner, win_track,
                   player_name = p4_name, empire = p4_empire, population = p4_population,
                   church = p4_church, total = p4_total, coins = p4_coins) %>%
            filter(!is.na(player_name), player_name != "")
        )
      } else .
    } %>%
    # Add win indicator
    mutate(
      won = player_name == winner,
      win_track_final = if_else(won, win_track, NA_character_)
    ) %>%
    arrange(game_id, player_name)
  
  return(df_long)
}

#' Helper function: null coalescing operator
`%||%` <- function(x, y) if(is.null(x)) y else x
