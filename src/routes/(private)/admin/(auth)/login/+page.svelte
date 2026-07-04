<div class=" flex min-h-screen items-center justify-center">
	<div class="card w-full max-w-sm shrink-0 bg-base-300 shadow-2xl">
		<form class="card-body" action="/admin?/login" method="POST">
			<fieldset class="fieldset">
				<label class="label" for="username">Username</label>
				<input type="text" name="username" class="input" placeholder="Username" />
				<label class="label" for="password">Password</label>
				<input type="password" name="password" class="input" placeholder="Password" />
				<button class="btn mt-4 btn-primary" type="submit">Login</button>
			</fieldset>
		</form>
	</div>
</div>
