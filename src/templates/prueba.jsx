<form className="form-subida" onSubmit={manejarSubida}>
  <fieldset disabled={subiendo}>
    <input
      type="text"
      placeholder="Nombre del modelo"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      required
    />

    <label>Seleccionar Categoría:</label>
    <select
      value={categoria}
      onChange={(e) => setCategoria(e.target.value)}
      required
    >
      <option value="">-- Seleccionar --</option>
      {categorias.map((cat, index) => (
        <option key={index} value={cat}>{cat}</option>
      ))}
    </select>

    <div className="nueva-categoria-container">
      {mostrarInputCategoria && (
        <input
          type="text"
          placeholder="Nueva Categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
        />
      )}
      <button
        type="button"
        className="btn-nueva-categoria"
        onClick={manejarNuevaCategoria}
      >
        {mostrarInputCategoria ? "✔ Agregar" : "➕ Nueva Categoría"}
      </button>
    </div>

    {/* 🔹 Input para subir archivo 3D */}
    <label>Subir Modelo (.glb o .gltf)</label>
    <input
      type="file"
      accept=".glb,.gltf"
      onChange={(e) => setArchivo(e.target.files[0])}
      required
    />

    {/* 🔹 Input para subir imagen miniatura */}
    <label>Subir Miniatura (Imagen PNG, JPG, JPEG, WEBP)</label>
    <input
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/webp"
      onChange={(e) => setMiniatura(e.target.files[0])}
      required
    />

    {subiendo && (
      <div className="progreso-container">
        <p>📊 Subiendo... {progreso}%</p>
        <div className="progreso-barra">
          <div className="progreso" style={{ width: `${progreso}%` }}></div>
        </div>
      </div>
    )}

    <button type="submit" className="btn-subir" disabled={subiendo}>
      {subiendo ? "Subiendo..." : "📤 Subir Modelo"}
    </button>
  </fieldset>
</form>
