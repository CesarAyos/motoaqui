<script>
 import { supabase } from "../../components/supabase.js";

let client = {
  primernombre: "",
  segundonombre: "",
  primerapellido: "",
  segundoapellido: "",
  contraseña: "",
  telefono: "",
  edad: "",
  ciudad: "",
  correo: "",
  cedula: "",
  sector: "",
  sanguineo: "",
};

const onSubmit = async () => {
  await signUpUser();
  clear();
};

const clear = () => {
  client = {
    primernombre: "",
    segundonombre: "",
    primerapellido: "",
    segundoapellido: "",
    contraseña: "",
    telefono: "",
    edad: "",
    ciudad: "",
    correo: "",
    cedula: "",
    sector: "",
    sanguineo: "",
  };
};

const signUpUser = async () => {
  try {
    // Registro del usuario con autenticación de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: client.correo,
      password: client.contraseña, 
    });

    if (authError) {
      console.error('Error al registrar usuario:', authError.message);
      return;
    }

    // Incluir información adicional en la tabla motoaquiClient
    const { data, error } = await supabase.from("motoaquiClient").insert([{
      primernombre: client.primernombre,
      segundonombre: client.segundonombre,
      primerapellido: client.primerapellido,
      segundoapellido: client.segundoapellido,
      telefono: client.telefono,
      edad: client.edad,
      ciudad: client.ciudad,
      correo: client.correo,
      cedula: client.cedula,
      sector: client.sector,
      sanguineo: client.sanguineo,
    }]);

    if (error) {
      console.error("Error al insertar datos:", error.message, error.details);
    } else {
      console.log("Datos insertados correctamente:", data);
    }

    alert("Se enviara un correo de verificación");

  } catch (error) {
    console.error("Error general:", error.message);
  }
}

</script>

<h2 class="text-center pt-2 text-white">
  Formulario de registro para clientes
</h2>

<form on:submit|preventDefault={onSubmit} class=" row g-3 p-5">
  <div class="col-md-3">
    <label for="validationDefault01" class="form-label text-white"
      >Primer Nombre</label
    >
    <input
      type="text"
      class="form-control"
      id="validationDefault01"
      bind:value={client.primernombre}
      placeholder="Primer Nombre "
      required
    />
  </div>
  <div class="col-md-3">
    <label for="validationDefault02" class="form-label text-white"
      >Segundo Nombre</label
    >
    <input
      type="text"
      class="form-control"
      id="validationDefault02"
      bind:value={client.segundonombre}
      placeholder="Segundo Nombre"
      required
    />
  </div>
  <div class="col-md-3">
    <label for="validationDefault02" class="form-label text-white"
      >Primer Apellido</label
    >
    <input
      type="text"
      class="form-control"
      id="validationDefault02"
      bind:value={client.primerapellido}
      placeholder="Primer Apellido"
      required
    />
  </div>
  <div class="col-md-3">
    <label for="validationDefault02" class="form-label text-white"
      >Segundo Apellido</label
    >
    <input
      type="text"
      class="form-control"
      id="validationDefault02"
      bind:value={client.segundoapellido}
      placeholder="Segundo Apellido"
      required
    />
  </div>
  <div class="col-md-3">
    <label for="contraseña" class="form-label text-white"
      >Contraseña debe tener 6 caracteres</label
    >
    <input
      type="password"
      class="form-control"
      id="contraseña"
      bind:value={client.contraseña}
      placeholder="Contraseña"
      required
    />
  </div>
  <div class="col-md-4">
    <label for="validationDefault02" class="form-label text-white"
      >Numero telefonico</label
    >
    <input
      type="tel"
      class="form-control"
      id="validationDefault02"
      bind:value={client.telefono}
      placeholder="Numero telefonico"
      required
    />
  </div>
  <div class="col-md-4">
    <label for="validationDefault02" class="form-label text-white">Edad</label>
    <input
      type="number"
      class="form-control"
      id="validationDefault02"
      bind:value={client.edad}
      placeholder="Edad"
      required
    />
  </div>
  <div class="col-md-4">
    <label for="validationDefault02" class="form-label text-white">Ciudad</label
    >
    <input
      type="text"
      class="form-control"
      id="validationDefault02"
      bind:value={client.ciudad}
      placeholder="Ciudad"
      required
    />
  </div>
  <div class="col-md-6">
    <label for="validationDefaultUsername" class="form-label text-white"
      >Correo Electronico</label
    >
    <div class="input-group">
      <span class="input-group-text text-white" id="inputGroupPrepend2">@</span>
      <input
        type="email"
        class="form-control"
        id="validationDefaultUsername"
        bind:value={client.correo}
        placeholder="Correo Electronico"
        aria-describedby="inputGroupPrepend2"
        required
      />
    </div>
  </div>
  <div class="col-md-6">
    <label for="validationDefaultUsername" class="form-label text-white"
      >Documento de Identidad</label
    >
    <div class="input-group">
      <input
        type="number"
        class="form-control"
        id="validationDefaultUsername"
        bind:value={client.cedula}
        placeholder="Cedula de indentidad"
        aria-describedby="inputGroupPrepend2"
        required
      />
    </div>
  </div>

  <div class="col-md-6">
    <label for="validationDefault04" class="form-label text-white">Sector</label
    >
    <select class="form-select" bind:value={client.sector} id="validationDefault04" required>
      <option selected disabled placeholder=""></option>
      <option class="text-white">Parte Alta</option>
      <option class="text-white">Casco Central</option>
      <option class="text-white">Parte Baja</option>
    </select>
  </div>
  <div class="col-md-6">
    <label for="validationDefault05" class="form-label text-white"
      >Grupo Sanguineo</label
    >
    <select class="form-select" bind:value={client.sanguineo} id="validationDefault05" required>
      <option selected disabled placeholder=""></option>
      <option class="text-white">Grupo "A+"</option>
      <option class="text-white">Grupo "A-"</option>
      <option class="text-white">Grupo "B+"</option>
      <option class="text-white">Grupo "B-"</option>
      <option class="text-white">Grupo "AB+"</option>
      <option class="text-white">Grupo "AB-"</option>
      <option class="text-white">Grupo "AB+"</option>
      <option class="text-white">Grupo "AB-"</option>
      <option class="text-white">Grupo "O-"</option>
      <option class="text-white">Grupo "O+"</option>
      <option class="text-white">No se</option>
    </select>
  </div>

  <!-- <h5 class="text-center pt-5 text-white">Imagen de perfil</h5>
  <div class="d-flex justify-content-center">
    <input type="file" class="m-5" name="img" id="profile" required />
  </div> -->

  <div class="d-flex justify-content-end">
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        placeholder=""
        id="invalidCheck2"
        required
      />
      <label class="form-check-label text-white" for="invalidCheck2">
        Confirmo que la informacion suministrada es confiable
      </label>
    </div>
  </div>
  <div class="d-flex justify-content-center">
    <button class="btn btn btn-outline-warning" type="submit"
      >registrarme</button
    >
  </div>
</form>

<style>
  * {
    background: #0e0d06;
  }
  input, select {
    color: white;
  }
  input::placeholder {
    color: white; 
  }
</style>


