import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  registrationCode: z.string().min(8, 'Código de convite obrigatório'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export function StudentRegister() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const codeFromUrl = searchParams.get('code') ?? ''

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { registrationCode: codeFromUrl },
  })

  const mutation = useMutation({
    mutationFn: (d: FormData) =>
      authApi.studentRegister({
        name: d.name,
        email: d.email,
        password: d.password,
        phone: d.phone,
        registrationCode: d.registrationCode,
      }),
    onSuccess: (data) => {
      login(data.accessToken, data.role)
      navigate('/student/workouts')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError('root', {
        message: err.response?.data?.message ?? 'Código inválido ou e-mail já cadastrado.',
      })
    },
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary mb-4">
            <Heart className="h-6 w-6 text-primary-foreground fill-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl text-foreground">Criar conta de Aluna</h1>
          <p className="text-muted-foreground text-sm mt-1">Você precisa de um código de convite do seu personal</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <Input label="Código de convite" placeholder="XXXXXXXX" error={errors.registrationCode?.message} {...register('registrationCode')} />
            <Input label="Nome completo" placeholder="Ana Souza" error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" type="email" placeholder="ana@email.com" error={errors.email?.message} {...register('email')} />
            <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
            <Input label="Senha" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar senha" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            {errors.root && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" loading={mutation.isPending} className="w-full" size="lg">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{' '}
            <Link to="/student/login" className="text-primary font-medium hover:opacity-70">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
