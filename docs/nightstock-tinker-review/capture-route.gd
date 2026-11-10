extends SceneTree
## Visual-only staging of the unchanged V1.3.1 package. No performance claims.
var main
var out := ""
var records: Array = []

func _initialize() -> void:
	_run.call_deferred()

func frames(n: int) -> void:
	for i in n: await physics_frame

func shot(id: String, station: float) -> void:
	main._update_shift_status()
	await process_frame
	await RenderingServer.frame_post_draw
	var pixels := root.get_texture().get_image()
	pixels.save_png(out.path_join(id + ".png"))
	records.append({"id":id, "station_m":station, "camera":str(main.camera.global_transform), "width":pixels.get_width(), "height":pixels.get_height(), "method":"Staged truck position, production camera and unchanged rendering; not a continuous drive."})
	print("CAPTURE ", id)

func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-dir="): out = arg.trim_prefix("--capture-dir=")
	if out.is_empty(): quit(2); return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920,1080)
	root.content_scale_size = Vector2i(1280,720)
	root.content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
	main = load("res://world/first_shift.tscn").instantiate()
	root.add_child(main)
	current_scene = main
	main.testing = true
	if main.preparation_active: await main.gameplay_ready
	while not main.shift_ready: await process_frame
	if main.shift_ui.is_phone_open(): main.toggle_phone()
	# Hide the mission overlay for scenic review; rendering/lighting are unchanged.
	main.shift_ui.visible = false
	main.truck.brake_input = 1.0
	main.truck.handbrake_input = true
	for entry in [["road",560.0],["bridge",1845.0],["forest",2500.0],["tunnel",2900.0],["countryside",3570.0]]:
		var station: float = entry[1]
		var f: Dictionary = main.road.sample_at(station)
		var pose := Transform3D(Basis.looking_at(f.forward,Vector3.UP), f.position - f.right * f.width * .25 + Vector3.UP * .85)
		main.truck.reset_at(pose)
		await frames(4)
		var placements: Array[Transform3D] = main.truck.get_cargo_spawn_transforms()
		for i in main.cargo.size():
			main.cargo[i].global_transform = placements[i]
			main.cargo[i].linear_velocity = Vector3.ZERO
			main.cargo[i].angular_velocity = Vector3.ZERO
		main.first_person = true
		main.look_pitch = -.035
		main.look_yaw = 0.0
		await frames(240)
		await shot(str(entry[0]) + "-cab",station)
		main.first_person = false
		await frames(120)
		await shot(str(entry[0]) + "-chase",station)
	var store: Node3D = main.world_geometry.get_node("Konbini")
	main.truck.reset_at(Transform3D(store.global_basis,store.to_global(Vector3(11.8,.85,.5))))
	await frames(120)
	main.set_process(false)
	main.camera.global_position = store.to_global(Vector3(22,4,17))
	main.camera.look_at(store.to_global(Vector3(3,2,0)))
	await shot("yorumichi-exterior",-1)
	var file := FileAccess.open(out.path_join("capture-records.json"),FileAccess.WRITE)
	file.store_string(JSON.stringify(records,"\t"))
	quit()
