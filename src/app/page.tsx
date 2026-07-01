
  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionActive(true);
          // Auto-redirect to dashboard if already logged in? Or let them click the button.
        }
      } catch (err) {
        // Fallback silently if unconfigured
      }
    }
    checkAuth();
  }, []);

  if (!mounted) {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center">
        <div className="text-[#E1E0CC] font-sans tracking-widest text-xs animate-pulse">
          INITIALIZING...
        </div>
      </div>
    );
  }

  // We can pass sessionActive to PrismaHero if we want to change the button text,
  // but for now let's just render the component as requested.
  return (
    <main className="min-h-screen bg-black">
      <SessionsHero />
      <FeaturesSection />
    </main>
  );
}
