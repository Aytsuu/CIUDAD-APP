import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import ARSchema from '@/form-schema/ar-scheme';
import { SelectLayout } from '@/components/ui/select/select-layout';

import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';


export default function DRRARForm(){

    const form = useForm<z.infer<typeof ARSchema>>({
        resolver: zodResolver(ARSchema),
        defaultValues: {
            name: '',
            dateStarted: '',  
            timeStarted: '',
            dateCompleted: '',
            timeCompleted: '',
            sitio: '',
            location : '',
            img: undefined
        }
    })

    const onSubmit = (values: z.infer<typeof ARSchema>) => {
        console.log(values)
    }

    return(

        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
                
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} 
                    className='w-1/2 h-2/3 bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-5'>
                    
                    <div className='w-full flex gap-4'>
                        <FormField
                            control={form.control}
                            name={'name'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Name of Incident/Activity</FormLabel>
                                <FormControl>
                                    <Input  {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        
                        />

                        <FormField
                            control={form.control}
                            name={'location'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                            
                        />
                        
                        <FormField
                            control={form.control}
                            name={'sitio'}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Sitio</FormLabel>
                                <FormControl>
                                    <SelectLayout 
                                        placeholder='Select a Sitio'
                                        label=''
                                        options={[{id: '1', name: 'bahog tae' }]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )} 
                        />
                    </div>

                    <div className='w-full flex gap-3'>
                        <FormField 
                            control={form.control}
                            name={'dateStarted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Date Started</FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name={'timeStarted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Time Started</FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name={'dateCompleted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Date Completed</FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name={'timeCompleted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormLabel>Time Completed</FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />

                    </div>
                    
                    <FormField 
                        control={form.control}
                        name={'action'}
                        render={({ field }) => (
                            <FormItem className='flex-grow'>
                            <FormLabel>Actions Taken</FormLabel>
                            <FormControl>
                                <Textarea className='h-[10rem]' {...field} />
                            </FormControl>
                            <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className='w-full h-full flex'>
                            <FormField
                                control={form.control}
                                name={'img'}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Upload an Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='file'
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : undefined;
                                                field.onChange(file);
                                            }}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                    </FormItem>
                                )}
                            />
                    </div>

                    <div className='flex justify-end'>
                        <Button type='submit'>
                            Create
                        </Button>
                    </div>

                </form>
            </Form>

        </div>

    );

}