/// The in-game menu already keeps this switch. The launcher has to show it and write the
/// same key, or a choice made on the Settings page never reaches the next game.
#[test]
fn the_launcher_keeps_realistic_road_physics() {
    let off = omsi_launcher_lib::settings_from_text(None);
    assert_eq!(off["realistic_road_physics"].as_bool(), Some(false));
    let saved = omsi_launcher_lib::settings_to_text(&off, None);
    assert!(
        !super::Settings::from_text(&saved).realistic_road_physics,
        "{saved}"
    );
    assert_eq!(
        saved.matches("realistic_road_physics=").count(),
        1,
        "{saved}"
    );

    let on = omsi_launcher_lib::settings_from_text(Some("realistic_road_physics=1\n"));
    assert_eq!(on["realistic_road_physics"].as_bool(), Some(true));
    let saved = omsi_launcher_lib::settings_to_text(&on, Some("Realistic_Road_Physics=1\n"));
    assert!(
        super::Settings::from_text(&saved).realistic_road_physics,
        "{saved}"
    );
    assert_eq!(
        saved.matches("realistic_road_physics=").count(),
        1,
        "{saved}"
    );
}
