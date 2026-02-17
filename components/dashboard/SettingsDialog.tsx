'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Wallet } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Kelola preferensi akun dan konfigurasi portofolio Anda.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="account" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notification</TabsTrigger>
          </TabsList>
          
          {/* TAB ACCOUNT */}
          <TabsContent value="account" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue="Natanael Alexander" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="founder@weatso.com" disabled className="bg-zinc-900/50 border-zinc-800 text-zinc-500" />
            </div>
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Investor Status</div>
                  <div className="text-xs text-zinc-400">Verified Pro Member</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">Upgrade</Button>
            </div>
          </TabsContent>

          {/* TAB APPEARANCE */}
          <TabsContent value="appearance" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dynamic Island Mode</Label>
                <div className="text-xs text-zinc-400">Aktifkan animasi UI yang lebih fluid.</div>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Heatmap Colors</Label>
                <div className="text-xs text-zinc-400">Gunakan warna buta warna (Colorblind safe).</div>
              </div>
              <Switch />
            </div>
          </TabsContent>

           {/* TAB NOTIFICATIONS */}
           <TabsContent value="notifications" className="space-y-4 py-4">
             {/* Placeholder */}
             <div className="p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                Belum ada notifikasi baru.
             </div>
           </TabsContent>

        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)} className="bg-white text-black hover:bg-zinc-200">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}