// Show "Dashboard" / "Esci" when logged, else "Accedi"
(async function(){
  const c = window.supabaseClient;
  const slot = document.getElementById('auth-slot');
  if (!slot) return;

  async function draw(){
    const { data: { session } } = await c.auth.getSession();
    if (session?.user){
      slot.innerHTML = '<a href="./dashboard.html">Dashboard</a> <button id="logout" class="ghost">Esci</button>';
      document.getElementById('logout').onclick = async ()=>{
        await c.auth.signOut();
        location.href = './affiliazioni.html';
      };
    } else {
      slot.innerHTML = '<a href="./affiliazioni.html#login">Accedi</a>';
    }
  }
  draw();
  c.auth.onAuthStateChange((_e)=> draw());
})();
