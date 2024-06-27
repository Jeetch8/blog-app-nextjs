'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  Autocomplete,
  Chip,
  Stack,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { profiles, users } from '@/db/schema';
import { useFetch, FetchStates } from '@/hooks/useFetch';
import { toast } from 'react-hot-toast';

const techStackOptions = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'Python',
  'Django',
  'Ruby',
  'Rails',
  'Java',
  'Spring',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'Vue.js',
  'Angular',
  'SQL',
  'MongoDB',
];

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  profileImage: z.instanceof(File).optional(),
  email: z.string().email('Invalid email'),
  username: z.string().min(6, 'Username must be at least 6 characters'),
  profileTagline: z
    .string()
    .max(100, 'Tagline must be 100 characters or less')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be 100 characters or less')
    .optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  techStack: z.array(z.string()),
  availableFor: z
    .string()
    .max(200, 'Available for must be 200 characters or less')
    .optional(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof schema>;

const ProfileForm = ({
  initialData,
}: {
  initialData: {
    user: typeof users.$inferSelect;
    profiles: typeof profiles.$inferSelect | null;
  };
}) => {
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // Add image upload fetch
  const { doFetch: uploadImage, fetchState: imageUploadState } = useFetch<{
    url: string;
  }>({
    url: '/api/uploads',
    method: 'POST',
    onSuccess: (data) => {
      setProfileImagePreview(data.url);
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
  });

  // Add profile update fetch
  const { doFetch: updateProfile, fetchState: updateState } = useFetch<{
    user: typeof users.$inferSelect;
    profile: typeof profiles.$inferSelect;
  }>({
    url: `/api/user/${initialData.user.username}/profile`,
    method: 'PUT',
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      // Update form with new data
      reset({
        fullName: data.user.name,
        email: data.user?.email || '',
        username: data.user?.username || '',
        profileTagline: data.profile?.tagline || '',
        location: data.profile?.location || '',
        bio: data.profile?.bio || '',
        techStack: data.profile?.techStack?.split(',') || [],
        availableFor: data.profile?.availableFor || '',
        websiteUrl: data.profile?.websiteUrl || '',
        twitterUrl: data.profile?.twitterUrl || '',
        githubUrl: data.profile?.githubUrl || '',
        linkedinUrl: data.profile?.linkedinUrl || '',
      });
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      await uploadImage(formData);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile({
      name: data.fullName,
      email: data.email,
      username: data.username,
      image: profileImagePreview,
      tagline: data.profileTagline,
      location: data.location,
      bio: data.bio,
      techStack: data.techStack,
      availableFor: data.availableFor,
      websiteUrl: data.websiteUrl,
      twitterUrl: data.twitterUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
    });
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      profileTagline: '',
      location: '',
      bio: '',
      techStack: [],
      availableFor: '',
      websiteUrl: '',
      twitterUrl: '',
      githubUrl: '',
      linkedinUrl: '',
    },
  });

  useEffect(() => {
    let techStack: string[] = [];
    if (initialData.profiles?.techStack) {
      techStack = initialData.profiles.techStack.split(',');
    }
    const obj: ProfileFormData = {
      fullName: initialData.user.name || '',
      email: initialData.user.email || '',
      username: initialData.user.username || '',
      profileImage: undefined,
      profileTagline: initialData.profiles?.tagline || '',
      location: initialData.profiles?.location || '',
      bio: initialData.profiles?.bio || '',
      techStack,
      availableFor: initialData.profiles?.availableFor || '',
      websiteUrl: initialData.profiles?.websiteUrl || '',
      twitterUrl: initialData.profiles?.twitterUrl || '',
      githubUrl: initialData.profiles?.githubUrl || '',
      linkedinUrl: initialData.profiles?.linkedinUrl || '',
    };
    setProfileImagePreview(initialData.user.image || '');
    reset(obj, { keepDirty: false, keepTouched: false });
  }, [initialData]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ mt: 1 }}
    >
      <Typography variant="h5" gutterBottom>
        Edit Profile
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          src={profileImagePreview || undefined}
          sx={{ width: 100, height: 100 }}
        />
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
      </Stack>

      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Full Name"
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Username"
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        )}
      />

      <Controller
        name="profileTagline"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Profile Tagline"
            error={!!errors.profileTagline}
            helperText={errors.profileTagline?.message}
          />
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Location"
            error={!!errors.location}
            helperText={errors.location?.message}
          />
        )}
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        About You
      </Typography>

      <Controller
        name="bio"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            multiline
            rows={4}
            label="Bio"
            error={!!errors.bio}
            helperText={errors.bio?.message}
          />
        )}
      />

      <Controller
        name="techStack"
        control={control}
        render={({ field }) => (
          <Autocomplete
            {...field}
            multiple
            options={techStackOptions}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tech Stack"
                margin="normal"
                error={!!errors.techStack}
                helperText={errors.techStack?.message}
              />
            )}
            onChange={(_, data) => field.onChange(data)}
          />
        )}
      />

      <Controller
        name="availableFor"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            multiline
            rows={2}
            label="Available For"
            error={!!errors.availableFor}
            helperText={errors.availableFor?.message}
          />
        )}
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Social Links
      </Typography>

      <Controller
        name="websiteUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Website URL"
            error={!!errors.websiteUrl}
            helperText={errors.websiteUrl?.message}
          />
        )}
      />

      <Controller
        name="twitterUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="Twitter URL"
            error={!!errors.twitterUrl}
            helperText={errors.twitterUrl?.message}
          />
        )}
      />

      <Controller
        name="githubUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="GitHub URL"
            error={!!errors.githubUrl}
            helperText={errors.githubUrl?.message}
          />
        )}
      />

      <Controller
        name="linkedinUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            label="LinkedIn URL"
            error={!!errors.linkedinUrl}
            helperText={errors.linkedinUrl?.message}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={
          updateState === FetchStates.LOADING ||
          imageUploadState === FetchStates.LOADING
        }
      >
        {updateState === FetchStates.LOADING ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
};

export default ProfileForm;
