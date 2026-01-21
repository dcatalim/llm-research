<script lang="ts">
	import type { PageProps } from './$types';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Download from '@lucide/svelte/icons/download';
	import Calendar from '@lucide/svelte/icons/calendar';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Clock from '@lucide/svelte/icons/clock';
	import Users from '@lucide/svelte/icons/users';
	import Activity from '@lucide/svelte/icons/activity';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { Chat, Model } from '$lib/pocketbase';
	import { formatDistanceToNow, format, startOfDay, subDays, isWithinInterval } from 'date-fns';

	let { data }: { data: { model: Model; chats: Chat[] } } = $props();

	let { model, chats } = data;

	// Filter state
	let dateRange = $state<'7d' | '30d' | 'all'>('7d');
	let selectedChat = $state<Chat | null>(null);

	// Analytics calculations
	const analytics = $derived(() => {
		const now = new Date();
		const filterDate =
			dateRange === '7d' ? subDays(now, 7) : dateRange === '30d' ? subDays(now, 30) : new Date(0);

		const filteredChats = chats.filter(
			(chat) => dateRange === 'all' || new Date(chat.created) >= filterDate
		);

		// Total interactions
		const totalChats = filteredChats.length;

		// Unique users
		const uniqueUsers = new Set(filteredChats.map((chat) => chat.browserId)).size;

		// Average chats per day
		const days =
			dateRange === '7d'
				? 7
				: dateRange === '30d'
					? 30
					: Math.max(
							1,
							Math.ceil(
								(now.getTime() - new Date(chats[chats.length - 1]?.created || now).getTime()) /
									(1000 * 60 * 60 * 24)
							)
						);
		const avgChatsPerDay = (totalChats / days).toFixed(1);

		// Activity by day
		const activityByDay = filteredChats.reduce(
			(acc, chat) => {
				const day = format(new Date(chat.created), 'yyyy-MM-dd');
				acc[day] = (acc[day] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		// Recent activity trend
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = subDays(now, 6 - i);
			return {
				date: format(date, 'MMM dd'),
				count: activityByDay[format(date, 'yyyy-MM-dd')] || 0
			};
		});

		return {
			totalChats,
			uniqueUsers,
			avgChatsPerDay,
			last7Days,
			filteredChats
		};
	});

	// Download functions
	async function downloadJSON() {
		try {
			// Fetch all chats with their messages
			const chatsWithMessages = await Promise.all(
				chats.map(async (chat) => {
					try {
						const response = await fetch(`/api/chat/${chat.id}/download`);
						if (!response.ok) {
							throw new Error('Failed to fetch chat data');
						}
						const chatData = await response.json();
						return {
							id: chat.id,
							uuid: chat.uuid,
							title: chat.title,
							created: chat.created,
							updated: chat.updated,
							// userId: chat.userId,
							browserId: chat.browserId,
							messages: chatData.messages,
							messageCount: chatData.messageCount
						};
					} catch (error) {
						console.error(`Error fetching chat ${chat.id}:`, error);
						return {
							id: chat.id,
							uuid: chat.uuid,
							title: chat.title,
							created: chat.created,
							updated: chat.updated,
							// userId: chat.userId,
							browserId: chat.browserId,
							messages: [],
							messageCount: 0,
							error: 'Failed to fetch messages'
						};
					}
				})
			);

			const dataToExport = {
				model: {
					name: model.name,
					id: model.id,
					provider: model.provider,
					version: model.version,
					created: model.created,
					systemPrompt: model.systemPrompt,
					instructions: model.instructions
				},
				chats: chatsWithMessages,
				analytics: analytics(),
				exportDate: new Date().toISOString()
			};

			const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${model.name.replace(/\s+/g, '_')}_analytics_${format(new Date(), 'yyyy-MM-dd')}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading JSON:', error);
			alert('Failed to download data. Please try again.');
		}
	}

	async function downloadCSV() {
		try {
			// Fetch all chats with their messages
			const chatsWithMessages = await Promise.all(
				chats.map(async (chat) => {
					try {
						const response = await fetch(`/api/chat/${chat.id}/download`);
						if (!response.ok) {
							throw new Error('Failed to fetch chat data');
						}
						const chatData = await response.json();
						return {
							chat,
							messages: chatData.messages
						};
					} catch (error) {
						console.error(`Error fetching chat ${chat.id}:`, error);
						return {
							chat,
							messages: []
						};
					}
				})
			);

			// Create CSV with template format
			const headers = [
				'public_id',
				'role',
				'text',
				'browser_id',
				'dialog_id',
				'dialog_state',
				'id',
				'created_at'
				// 'feedback_thumbs',
				// 'feedback_text',
				// 'suggested_replies'
			];

			const rows: string[][] = [];

			// For each chat, create a row for each message
			chatsWithMessages.forEach(({ chat, messages }) => {
				// Build dialog_state with all messages
				const dialogState = {
					messages: messages.map((msg: any) => {
						const content =
							Array.isArray(msg.parts) && msg.parts.length > 0
								? msg.parts
										.map((part: any) => {
											if (typeof part === 'string') return part;
											if (part?.text) return part.text;
											if (part?.type === 'image') return '[Image]';
											if (part?.type === 'file') return '[File]';
											return JSON.stringify(part);
										})
										.join(' ')
								: '';

						return {
							role: msg.role || 'user',
							content: content,
							name: null
						};
					}),
					products_by_url: {}
				};

				// Add a row for each message
				messages.forEach((message: any, index: number) => {
					const messageContent =
						Array.isArray(message.parts) && message.parts.length > 0
							? message.parts
									.map((part: any) => {
										if (typeof part === 'string') return part;
										if (part?.text) return part.text;
										if (part?.type === 'image') return '[Image]';
										if (part?.type === 'file') return '[File]';
										return JSON.stringify(part);
									})
									.join(' ')
							: '';

					rows.push([
						message.id || chat.uuid || '', // public_id
						message.role || 'user', // role
						messageContent, // text
						chat.browserId || '', // browserId
						chat.id, // dialog_id
						JSON.stringify(dialogState), // dialog_state
						message.id || '', // id
						message.created
							? format(new Date(message.created), 'yyyy-MM-dd HH:mm:ss.SSS xxx')
							: format(new Date(chat.created), 'yyyy-MM-dd HH:mm:ss.SSS xxx') // created_at
						// '', // feedback_thumbs
						// '', // feedback_text
						// '' // suggested_replies
					]);
				});
			});

			const csv = [
				headers.join(','),
				...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
			].join('\n');

			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${model.name.replace(/\s+/g, '_')}_messages_${format(new Date(), 'yyyy-MM-dd')}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading CSV:', error);
			alert('Failed to download data. Please try again.');
		}
	}

	// Download individual chat with messages
	async function downloadChat(chat: Chat) {
		try {
			const response = await fetch(`/api/chat/${chat.id}/download`);
			if (!response.ok) {
				throw new Error('Failed to download chat');
			}

			const chatData = await response.json();

			const blob = new Blob([JSON.stringify(chatData, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading chat:', error);
			alert('Failed to download chat. Please try again.');
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">{model?.name}</h1>
			<p class="text-muted-foreground">Analytics and interaction data for your LLM model</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={downloadCSV}>
				<Download class="mr-2 h-4 w-4" />
				Export CSV
			</Button>
			<Button onclick={downloadJSON}>
				<Download class="mr-2 h-4 w-4" />
				Export JSON
			</Button>
		</div>
	</div>

	<!-- Filter Controls -->
	<Card.Card>
		<Card.CardContent class="pt-6">
			<div class="flex items-center gap-2">
				<Calendar class="h-4 w-4 text-muted-foreground" />
				<span class="text-sm font-medium">Time Range:</span>
				<div class="flex gap-2">
					<Button
						variant={dateRange === '7d' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (dateRange = '7d')}
					>
						Last 7 Days
					</Button>
					<Button
						variant={dateRange === '30d' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (dateRange = '30d')}
					>
						Last 30 Days
					</Button>
					<Button
						variant={dateRange === 'all' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (dateRange = 'all')}
					>
						All Time
					</Button>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Analytics Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total Chats -->
		<Card.Card>
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium">Total Chats</Card.CardTitle>
				<MessageSquare class="h-4 w-4 text-muted-foreground" />
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-2xl font-bold">{analytics().totalChats}</div>
				<p class="text-xs text-muted-foreground">
					{dateRange === '7d'
						? 'in the last 7 days'
						: dateRange === '30d'
							? 'in the last 30 days'
							: 'all time'}
				</p>
			</Card.CardContent>
		</Card.Card>

		<!-- Unique Users -->
		<Card.Card>
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium">Unique Users</Card.CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-2xl font-bold">{analytics().uniqueUsers}</div>
				<p class="text-xs text-muted-foreground">Active users in range</p>
			</Card.CardContent>
		</Card.Card>

		<!-- Avg Per Day -->
		<Card.Card>
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium">Avg Chats/Day</Card.CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-2xl font-bold">{analytics().avgChatsPerDay}</div>
				<p class="text-xs text-muted-foreground">Average daily interactions</p>
			</Card.CardContent>
		</Card.Card>

		<!-- Model Info -->
		<Card.Card>
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium">Model Version</Card.CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-sm font-bold">{model.version}</div>
				<p class="text-xs text-muted-foreground">{model.provider}</p>
			</Card.CardContent>
		</Card.Card>
	</div>

	<!-- Activity Chart (Simple Text-Based) -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Activity Trend (Last 7 Days)</Card.CardTitle>
			<Card.CardDescription>Daily interaction volume</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			<div class="space-y-2">
				{#each analytics().last7Days as day}
					<div class="flex items-center gap-2">
						<div class="w-20 text-sm text-muted-foreground">{day.date}</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<div
									class="h-6 rounded bg-primary transition-all"
									style="width: {Math.max(
										5,
										(day.count / Math.max(...analytics().last7Days.map((d) => d.count), 1)) * 100
									)}%"
								></div>
								<span class="text-sm font-medium">{day.count}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Model Configuration -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Model Configuration</Card.CardTitle>
			<Card.CardDescription>Current settings for this model</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			<div class="grid gap-3 sm:grid-cols-2">
				<div>
					<div class="text-sm font-medium">Temperature</div>
					<div class="text-2xl font-bold">{model.temperature}</div>
				</div>
				<div>
					<div class="text-sm font-medium">Max Tokens</div>
					<div class="text-2xl font-bold">{model.maxTokens}</div>
				</div>
				<div>
					<div class="text-sm font-medium">Top P</div>
					<div class="text-2xl font-bold">{model.topP}</div>
				</div>
				<div>
					<div class="text-sm font-medium">Frequency Penalty</div>
					<div class="text-2xl font-bold">{model.frequencyPenalty}</div>
				</div>
			</div>
			<div class="mt-4 space-y-2">
				<div>
					<div class="text-sm font-medium">System Prompt</div>
					<p class="mt-1 text-sm text-muted-foreground">{model.systemPrompt}</p>
				</div>
				{#if model.instructions}
					<div>
						<div class="text-sm font-medium">Instructions</div>
						<p class="mt-1 text-sm text-muted-foreground">{model.instructions}</p>
					</div>
				{/if}
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Interactions Table -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Recent Interactions</Card.CardTitle>
			<Card.CardDescription>
				Showing {analytics().filteredChats.length} chat{analytics().filteredChats.length !== 1
					? 's'
					: ''}
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			{#if analytics().filteredChats.length === 0}
				<div class="flex flex-col items-center justify-center py-8 text-center">
					<MessageSquare class="h-12 w-12 text-muted-foreground/50" />
					<h3 class="mt-4 text-lg font-semibold">No interactions yet</h3>
					<p class="text-sm text-muted-foreground">Start a chat to see analytics here</p>
				</div>
			{:else}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head >Title</Table.Head>
								<Table.Head class="hidden lg:table-cell">Created</Table.Head>
								<Table.Head class="hidden lg:table-cell">Updated</Table.Head>
								<Table.Head>Browser ID</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each analytics().filteredChats.slice(0, 20) as chat (chat.id)}
								<Table.Row>
									<Table.Cell class="max-w-[150px] overflow-hidden font-medium text-ellipsis"
										>{chat.title}</Table.Cell
									>
									<Table.Cell class="hidden lg:table-cell">
										<div class="flex items-center gap-2 text-sm">
											<Clock class="h-3 w-3 text-muted-foreground" />
											{formatDistanceToNow(new Date(chat.created), { addSuffix: true })}
										</div>
									</Table.Cell>
									<Table.Cell class="hidden text-sm text-muted-foreground lg:table-cell">
										{format(new Date(chat.updated), 'MMM dd, yyyy')}
									</Table.Cell>
									<Table.Cell>
										<Badge
											variant="outline"
											class="max-w-[100px] cursor-pointer font-mono text-xs "
											onclick={() => navigator.clipboard.writeText(chat.browserId)}
										>
											<span class="sr-only">Browser ID:</span>
											<p class="truncate">
												{chat.browserId}
											</p>
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => (selectedChat = chat)}
												target="_blank"
												href={`/chat/${chat.uuid}`}
											>
												View
											</Button>
											<Button
												variant="outline"
												size="sm"
												title="Download chat with messages"
												onclick={() => downloadChat(chat)}
											>
												<Download class="h-3 w-3" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
				{#if analytics().filteredChats.length > 20}
					<p class="mt-4 text-center text-sm text-muted-foreground">
						Showing 20 of {analytics().filteredChats.length} chats
					</p>
				{/if}
			{/if}
		</Card.CardContent>
	</Card.Card>
</div>
