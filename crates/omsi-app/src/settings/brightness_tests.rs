/// Brightness is a graphics setting now: the launcher and the game share one key, and 1
/// leaves a picture as the weather drew it.
#[test]
fn the_launcher_keeps_brightness_for_every_map() {
    let fresh = omsi_launcher_lib::settings_from_text(None);
    assert_eq!(fresh["brightness"].as_f64(), Some(1.0));
    assert!(omsi_launcher_lib::GRAPHICS_PROFILE_KEYS.contains(&"brightness"));
    let saved = omsi_launcher_lib::settings_to_text(&fresh, None);
    assert!(
        (super::Settings::from_text(&saved).brightness - 1.0).abs() < 1e-5,
        "{saved}"
    );

    let dim = omsi_launcher_lib::settings_from_text(Some("brightness=0.5\n"));
    assert!((dim["brightness"].as_f64().unwrap() - 0.5).abs() < 1e-5);
    let saved = omsi_launcher_lib::settings_to_text(&dim, Some("brightness=0.5\nBrightness=9\n"));
    assert!(
        (super::Settings::from_text(&saved).brightness - 0.5).abs() < 1e-5,
        "{saved}"
    );
    assert_eq!(
        saved
            .lines()
            .filter(|l| l.starts_with("brightness="))
            .count(),
        1,
        "{saved}"
    );

    let hot = omsi_launcher_lib::settings_from_text(Some("brightness=9\n"));
    assert!((hot["brightness"].as_f64().unwrap() - 1.5).abs() < 1e-5);
    let back = super::Settings::default();
    assert!((super::Settings::from_text(&back.to_text()).brightness - 1.0).abs() < 1e-5);
}
