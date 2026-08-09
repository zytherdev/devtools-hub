tailwind.config = {
    theme: {
        extend: {
            colors: {
                // cores
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',

                // bgs
                card: 'var(--bg-card)',
                body: 'var(--bg-body)',
                input: 'var(--bg-input)',
                'input-readonly': 'var(--bg-input-readonly)',
                hover: 'var(--bg-hover)',

                // bdrs
                border: 'var(--border-color)',
                'border-focus': 'var(--border-focus)',
                muted: 'var(--text-muted)',

                // bdgs
                badge: 'var(--badge-bg)',
                'badge-text': 'var(--badge-text)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            }
        }
    }
}