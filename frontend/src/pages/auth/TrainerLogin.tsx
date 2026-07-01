import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function TrainerLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: authApi.trainerLogin,
    onSuccess: (data) => {
      login(data.accessToken, data.role)
      navigate('/trainer/dashboard')
    },
    onError: () => {
      setError('root', { message: 'E-mail ou senha incorretos.' })
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 mb-4">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Entrar como Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Acesse sua plataforma de gestão</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            {errors.root && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" loading={mutation.isPending} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link to="/trainer/register" className="text-primary-600 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            <Link to="/" className="hover:text-gray-600">← Voltar ao início</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
