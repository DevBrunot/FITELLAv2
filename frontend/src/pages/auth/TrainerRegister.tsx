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
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export function TrainerRegister() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (d: FormData) =>
      authApi.trainerRegister({ name: d.name, email: d.email, password: d.password, phone: d.phone }),
    onSuccess: (data) => {
      login(data.accessToken, data.role)
      navigate('/trainer/dashboard')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError('root', {
        message: err.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.',
      })
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 mb-4">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta de Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Comece a gerenciar suas alunas hoje</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <Input label="Nome completo" placeholder="Maria Silva" error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" type="email" placeholder="maria@email.com" error={errors.email?.message} {...register('email')} />
            <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
            <Input label="Senha" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar senha" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            {errors.root && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" loading={mutation.isPending} className="w-full" size="lg">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/trainer/login" className="text-primary-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
