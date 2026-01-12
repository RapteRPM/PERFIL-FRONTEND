import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const axiosInstance = axios.create({
  withCredentials: true, // Importante para enviar cookies de sesión
  jar: true
});

async function testCierreSesion() {
  console.log('🧪 === PRUEBA DE CIERRE DE SESIÓN AL CAMBIAR CONTRASEÑA === 🧪\n');

  try {
    // Test 1: Verificar que la respuesta incluye la bandera cerrarSesion
    console.log('📝 Test: Cambiar contraseña y verificar cierre de sesión');
    try {
      const response = await axiosInstance.put(`${BASE_URL}/api/usuarios/1019103194/contrasena`, {
        nuevaContrasena: 'NuevaPrueba123!'
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      if (response.data.cerrarSesion === true) {
        console.log('✅ El servidor indica que la sesión debe cerrarse');
      } else {
        console.log('⚠️ El servidor NO indicó cierre de sesión explícitamente');
      }
      
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.msg || error.message);
    }
    
    console.log('\n🎉 === PRUEBA COMPLETADA === 🎉');
    console.log('\n📋 Instrucciones para prueba manual:');
    console.log('1. Inicia sesión en la aplicación web');
    console.log('2. Ve a cambiar contraseña');
    console.log('3. Cambia la contraseña exitosamente');
    console.log('4. Verifica que te redirige al login');
    console.log('5. Ve manualmente al index.html');
    console.log('6. ✅ El usuario NO debería aparecer logueado');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

testCierreSesion();
