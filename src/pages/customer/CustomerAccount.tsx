
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const CustomerAccount = () => {
  const { currentUser } = useUser();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Minha Conta</h1>
        <p className="text-gray-500">Gerencie suas informações e pedidos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Dados Pessoais</h3>
              <p className="text-sm text-gray-500 mb-4">
                Atualize seus dados de contato e endereço
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/profile">
                  Editar perfil
                </Link>
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Meus Pedidos</h3>
              <p className="text-sm text-gray-500 mb-4">
                Visualize seu histórico de pedidos
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/orders">
                  Ver pedidos
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Informações da conta</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="font-medium">{currentUser?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{currentUser?.email}</p>
          </div>
          
          {currentUser?.phone && (
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{currentUser.phone}</p>
            </div>
          )}
          
          {currentUser?.address && (
            <div>
              <p className="text-sm text-gray-500">Endereço principal</p>
              <p className="font-medium">
                {`${currentUser.address.street}, ${currentUser.address.number} - ${currentUser.address.neighborhood}, ${currentUser.address.city} - ${currentUser.address.state}`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomerAccount;
