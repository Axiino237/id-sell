declare module '@supabase/auth-ui-react' {
    import { SupabaseClient } from '@supabase/supabase-js'
    import { ThemeSupa } from '@supabase/auth-ui-shared'
    import { ReactNode } from 'react'

    export interface AuthProps {
        supabaseClient: SupabaseClient
        appearance?: {
            theme?: any
            variables?: any
            prependedClassName?: string
            extend?: boolean
            className?: any
        }
        theme?: string
        providers?: string[]
        view?: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password' | 'update_password' | 'verify_otp'
        redirectTo?: string
        showLinks?: boolean
        otpType?: 'sms' | 'email'
        localization?: {
            variables?: any
        }
    }

    export const Auth: (props: AuthProps) => ReactNode
}

declare module '@supabase/auth-ui-shared' {
    export const ThemeSupa: any
    export const ThemeMinimal: any
}
