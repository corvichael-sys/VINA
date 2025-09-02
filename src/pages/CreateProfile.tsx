import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").max(20, "Username must be 20 characters or less.").refine(s => !s.includes('@'), "Username cannot contain '@' symbol."),
  pin: z.string().min(4, "PIN must be 4-6 digits.").max(6, "PIN must be 4-6 digits.").regex(/^\d+$/, "PIN must only contain digits."),
  pinConfirm: z.string(),
  avatar: z.instanceof(FileList).optional(),
}).refine(data => data.pin === data.pinConfirm, {
  message: "PINs do not match.",
  path: ["pinConfirm"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const CreateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      pin: "",
      pinConfirm: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    let avatar_path: string | undefined = undefined;

    // 1. Handle avatar upload if one is provided
    if (data.avatar && data.avatar.length > 0) {
      const file = data.avatar[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast({ variant: "destructive", title: "Avatar Upload Failed", description: uploadError.message });
        setIsSubmitting(false);
        return;
      }
      avatar_path = filePath;
    }

    // 2. Sign up the new user using the PIN as the password
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `${data.username}@debt-tracker.local`, // Create a dummy email
      password: data.pin,
      options: {
        data: {
          username: data.username,
          avatar_url: avatar_path,
        },
      },
    });

    if (signUpError) {
      toast({ variant: "destructive", title: "Failed to Create Profile", description: signUpError.message });
      setIsSubmitting(false);
      return;
    }
    
    if (signUpData.user) {
        // Store profile in local storage for the lock screen to find
        const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
        profiles.push({ username: data.username, avatar_url: avatar_path });
        localStorage.setItem('profiles', JSON.stringify(profiles));
        localStorage.setItem('lastUsername', data.username);

        toast({ title: "Profile Created!", description: "You can now log in with your new PIN." });
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-4" />
          <CardTitle>Create Profile</CardTitle>
          <CardDescription>Set up your profile to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john_doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (4-6 digits)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pinConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/png, image/jpeg" {...form.register("avatar")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 text-md bg-primary hover:bg-primary/90 mt-6" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Profile"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button asChild variant="link" className="text-muted-foreground">
              <Link to="/">Back to Lock Screen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;