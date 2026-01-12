import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testCambioContrasena() {
  console.log('🧪 === PRUEBAS DE CAMBIO DE CONTRASEÑA === 🧪\n');

  try {
    // Test 1: Cambiar contraseña con una nueva válida
    console.log('📝 Test 1: Cambiar contraseña con una nueva válida');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/1/contrasena`, {
        nuevaContrasena: 'NuevaPass123!'
      });
      console.log('✅ Test 1 Exitoso:', response.data.msg);
    } catch (error) {
      console.error('❌ Test 1 Fallido:', error.response?.data?.msg || error.message);
    }
    console.log('');

    // Test 2: Intentar usar la misma contraseña
    console.log('📝 Test 2: Intentar usar la misma contraseña que acabamos de crear');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/1/contrasena`, {
        nuevaContrasena: 'NuevaPass123!'
      });
      console.log('❌ Test 2 debería haber fallado pero pasó:', response.data.msg);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.msg.includes('ya fue utilizada')) {
        console.log('✅ Test 2 Exitoso: El sistema detectó que la contraseña ya fue usada');
        console.log('   Mensaje:', error.response.data.msg);
      } else {
        console.error('❌ Test 2 Fallido con error inesperado:', error.response?.data?.msg || error.message);
      }
    }
    console.log('');

    // Test 3: Cambiar a otra contraseña diferente
    console.log('📝 Test 3: Cambiar a otra contraseña diferente');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/1/contrasena`, {
        nuevaContrasena: 'OtraPass456@'
      });
      console.log('✅ Test 3 Exitoso:', response.data.msg);
    } catch (error) {
      console.error('❌ Test 3 Fallido:', error.response?.data?.msg || error.message);
    }
    console.log('');

    // Test 4: Intentar contraseña sin mayúscula
    console.log('📝 Test 4: Intentar contraseña sin mayúscula (debe fallar)');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/1/contrasena`, {
        nuevaContrasena: 'sinmayuscula123!'
      });
      console.log('❌ Test 4 debería haber fallado pero pasó');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Test 4 Exitoso: Validación de mayúscula funcionó');
        console.log('   Mensaje:', error.response.data.msg);
      } else {
        console.error('❌ Test 4 Fallido:', error.response?.data?.msg || error.message);
      }
    }
    console.log('');

    // Test 5: Intentar contraseña muy corta
    console.log('📝 Test 5: Intentar contraseña muy corta (debe fallar)');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/1/contrasena`, {
        nuevaContrasena: 'Aa1!'
      });
      console.log('❌ Test 5 debería haber fallado pero pasó');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Test 5 Exitoso: Validación de longitud funcionó');
        console.log('   Mensaje:', error.response.data.msg);
      } else {
        console.error('❌ Test 5 Fallido:', error.response?.data?.msg || error.message);
      }
    }
    console.log('');

    // Test 6: Usuario no existente
    console.log('📝 Test 6: Usuario no existente (debe fallar)');
    try {
      const response = await axios.put(`${BASE_URL}/api/usuarios/99999/contrasena`, {
        nuevaContrasena: 'ValidPass123!'
      });
      console.log('❌ Test 6 debería haber fallado pero pasó');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Test 6 Exitoso: Usuario no encontrado detectado correctamente');
        console.log('   Mensaje:', error.response.data.msg);
      } else {
        console.error('❌ Test 6 Fallido:', error.response?.data?.msg || error.message);
      }
    }

    console.log('\n🎉 === PRUEBAS COMPLETADAS === 🎉');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

testCambioContrasena();
